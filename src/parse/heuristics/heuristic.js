import { getAllRules, makeTypeKey } from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
} from "../parsingUtils.js";
import { debugFunction, runFunctionOrValue } from "../../util/index.js";
import { genericType, thisSubtype, type } from "../ruleUtils.js";

const lazyCombiner =
    (combiner) =>
    ([currentValueFast, currentValueSlow], [newValueFast, newValueSlow]) => {
        return [
            combiner(currentValueFast, newValueFast),
            currentValueSlow || newValueSlow
                ? (...args) => {
                      if (!currentValueSlow) return newValueSlow(...args);
                      if (!newValueSlow) return currentValueSlow(...args);
                      return combiner(
                          currentValueSlow(...args),
                          newValueSlow(...args)
                      );
                  }
                : undefined,
        ];
    };

export const transformHeuristicValue = ([fastValue, slowValue], transform) => {
    return [
        transform(fastValue),
        slowValue
            ? (inputTypes) => transform(slowValue(inputTypes))
            : undefined,
    ];
};

export const newHeuristic = (contextWrapper) => (context) => {
    // Needed to be able to give the newHeuristic access to the context so that it can depend on other heuristics if it wants to
    const {
        heuristicName,
        initialTokenValue,
        initialPatternValue,
        unresolvedValue,
        combinePatternValues: combinePatternValuesBase,
        combineTokenValues: combineTokenValuesBase,
        getTerminalTokenValue,
        getTokenDictValue,
        getMultiMetatypeValue = undefined,
        test,
        killPatternList = () => false,
        killPattern = () => false,
        patternReverseOrder = false,
        finalCheck = () => {},
        allowAllEmptyExpressions = true,
    } = runFunctionOrValue(contextWrapper, context);

    // Turning these into lazy combiners allows for values to be returned only on resolution
    const combinePatternValues = lazyCombiner(combinePatternValuesBase);
    const combineTokenValues = lazyCombiner(combineTokenValuesBase);

    const typeValues = {};
    let unresolved, cache; // NOTE: Need cache since its only calculating the FULL value when at top level, many sub cases it is only checking if it is "worth" checking
    let topLevel = true;

    const heuristicObject = {
        heuristicName,
        values: {
            fromTypeToken: (typeToken) => {
                const [fastValue, slowValue] = heuristicObject.values.fromType(
                    typeToken.type
                );
                return slowValue
                    ? combineTokenValuesBase(
                          fastValue,
                          slowValue(typeToken.subtypes)
                      )
                    : fastValue;
            },
            fromType: debugFunction(
                (typeName) => {
                    // (Maybe can be done in a different way in the future, but this is to prevent passing the unresolved and cache down every single call)
                    const scopeTopLevel = topLevel;

                    if (scopeTopLevel) {
                        topLevel = false;
                        unresolved = {};
                        cache = { ...typeValues };
                    }

                    if (cache[typeName] !== undefined) {
                        if (scopeTopLevel) topLevel = true;
                        return cache[typeName];
                    }

                    const typeToken = type(
                        typeName,
                        ...Array(context.generics.subtypeLengths[typeName] || 0)
                            .fill()
                            .map((_, i) => ({ inputType: i }))
                    );

                    // const typeKey = makeTypeKey(typeToken);

                    if (unresolved[typeName])
                        return context.generics.subtypeLengths[typeName]
                            ? [
                                  0,
                                  (inputTypes) => {
                                      const [fastValue, slowValue] =
                                          heuristicObject.values.fromType(
                                              typeName
                                          );
                                      return slowValue
                                          ? combineTokenValuesBase(
                                                fastValue,
                                                slowValue(inputTypes)
                                            )
                                          : fastValue;
                                  },
                              ]
                            : [runFunctionOrValue(unresolvedValue)];
                    unresolved[typeName] = true;

                    cache[typeName] = heuristicObject.values.fromPatternList(
                        getAllRules(typeToken, context).map(
                            ({ pattern }) => pattern
                        )
                    );

                    if (scopeTopLevel) {
                        typeValues[typeName] = cache[typeName];
                        // Check and warn of any issues (Only really used by minLength)
                        finalCheck(typeValues[typeName], typeName);
                        topLevel = true;
                    }

                    return cache[typeName];
                },
                "fromType",
                [true]
            ),
            fromToken: (token) => {
                if (isTerminal(token)) return [getTerminalTokenValue(token)];

                // Generic types
                if (token.thisType)
                    throw "Should have been handled in the getAllRules()";
                if (token.thisSubtype !== undefined)
                    throw "Should have been handled in the getAllRules()";

                if (token.inputType !== undefined)
                    return [
                        runFunctionOrValue(initialPatternValue),
                        (typeInputs) => {
                            const [fastValue, slowValue] =
                                heuristicObject.values.fromType(
                                    typeInputs[token.inputType]
                                );
                            return slowValue
                                ? combineTokenValuesBase(
                                      fastValue,
                                      slowValue(typeInputs)
                                  )
                                : undefined;
                        },
                    ];
                if (token.genericType)
                    return [
                        runFunctionOrValue(initialPatternValue),
                        // ({ genericTypeMap }) =>
                        //     heuristicObject.values.fromType(
                        //         genericTypeMap[token.genericType]
                        //     ),
                    ]; // Needs to then iterate and combine pattern heuristics over all possible generics

                // standard type
                if (!token.metaType) {
                    const [fastValue, slowValue] =
                        heuristicObject.values.fromType(token.type);

                    return [
                        fastValue, // I think this might be wrong
                        slowValue ? () => slowValue(token.subtypes) : undefined,
                    ];
                }

                // Assume metatype
                switch (token.metaType) {
                    case "or":
                        return heuristicObject.values.fromPatternList(
                            token.patterns
                        );
                    case "multi":
                        const getValue = () =>
                            heuristicObject.values.fromPattern(token.pattern);
                        // Max and min had extra rules here that I didnt wanna get rid of,
                        //   passing this in as a function is only a slight optimization.
                        // (Doesn't need to run if the min/max is == 0)
                        if (getMultiMetatypeValue)
                            return getMultiMetatypeValue(token, getValue);

                        return getValue();

                    case "anychar":
                        return [getTokenDictValue(token)];
                    case "subcontext":
                        return heuristicObject.values.fromSubcontext(token);
                }
            },
            fromPattern: debugFunction(
                (pattern) => {
                    let currentValue = [
                        runFunctionOrValue(initialPatternValue),
                    ];
                    for (let i = 0; i < pattern.length; i++) {
                        // End tokendict needs to go in opposite direction
                        const token =
                            pattern[
                                patternReverseOrder ? pattern.length - 1 - i : i
                            ];
                        currentValue = combineTokenValues(
                            currentValue,
                            heuristicObject.values.fromToken(token)
                        );

                        if (killPattern(currentValue, token)) break;
                    }
                    return currentValue;
                },
                "fromPattern",
                [stringifyPattern]
            ),
            fromPatternList: (patternList) => {
                let value = [runFunctionOrValue(initialTokenValue)];
                for (const pattern of patternList) {
                    value = combinePatternValues(
                        value,
                        heuristicObject.values.fromPattern(pattern)
                    );
                    if (killPatternList(value)) break;
                }
                return value;
            },
            fromSubcontext: (subcontextToken) => {
                if (context.parentContexts[subcontextToken.subcontextId])
                    return heuristicObject.values.fromPattern(
                        subcontextToken.pattern
                    );

                return subcontextToken
                    .getSubcontext()
                    .heuristics[heuristicName].values.fromPattern(
                        subcontextToken.pattern
                    );
            },
        },
        tests: {
            fromTypeToken: (typeToken, expression) => {
                // Wasnt in original heuristic check but might as well be?
                if (allowAllEmptyExpressions && expression.length === 0)
                    return true;

                const [fastValue, slowValue] = heuristicObject.values.fromType(
                    typeToken.type
                );
                if (test(expression, fastValue)) return true;

                const value = slowValue
                    ? combineTokenValuesBase(
                          fastValue,
                          slowValue(typeToken.subtypes)
                      )
                    : fastValue;

                return (
                    test(expression, value) || {
                        error: `"${expression}" failed the heuristic test "${heuristicName}" for type: ${stringifyToken(
                            typeToken
                        )}!`,
                        value,
                    }
                );
            },
            fromPattern: (pattern, expression) => {
                throw "THIS IS BROKEN NEED TO FIX";
                if (allowAllEmptyExpressions && expression.length === 0)
                    return true;
                const value = heuristicObject.values.fromPattern(pattern);
                return (
                    test(expression, value) || {
                        error: `"${expression}" failed the heuristic test "${heuristicName}" for meta-type: ${stringifyPattern(
                            pattern
                        )}!"`,
                        value,
                    }
                );
            },
        },
        typeValues,
    };
    return heuristicObject;
};
