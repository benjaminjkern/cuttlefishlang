import { getAllRules, makeTypeKey } from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
} from "../parsingUtils.js";
import {
    cacheValue,
    debugFunction,
    runFunctionOrValue,
} from "../../util/index.js";
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

    const heuristicObject = {
        heuristicName,
        values: {
            fromType: (typeName, typeKeySeen) => {
                if (typeValues[typeName]) return typeValues[typeName];

                // Cache only completed values
                typeValues[typeName] = heuristicObject.values.fromPatternList(
                    getAllRules(typeName, context).map(
                        ({ pattern }) => pattern
                    ),
                    typeKeySeen
                );

                finalCheck(typeValues[typeName], typeName);

                return typeValues[typeName];
            },
            fromTypeToken: (typeToken, typeKeySeen = {}) => {
                const typeKey = makeTypeKey(typeToken);

                // Make a copy so parent doesnt include changes from here on out
                const unresolvedTypeKey = { ...typeKeySeen };

                // Catch infinite loops
                if (unresolvedTypeKey[typeKey])
                    return [runFunctionOrValue(unresolvedValue)];
                unresolvedTypeKey[typeKey] = true;

                const [fastValue, slowValue] = heuristicObject.values.fromType(
                    typeToken.type,
                    unresolvedTypeKey
                );

                if (!slowValue) return [fastValue];

                // Do the evaluation with any KNOWN subtypes
                const [fastEvaluated, slowEvaluated] = slowValue(
                    typeToken.subtypes
                );

                return [
                    combineTokenValuesBase(fastValue, fastEvaluated),
                    slowEvaluated,
                ];
            },
            fromToken: (token, typeKeySeen) => {
                if (isTerminal(token)) return [getTerminalTokenValue(token)];

                // Generic types
                if (token.thisType)
                    throw "Should have been handled in the getAllRules()";
                if (token.thisSubtype !== undefined)
                    throw "Should have been handled in the getAllRules()";

                if (token.inputType !== undefined)
                    return [
                        runFunctionOrValue(initialPatternValue),
                        (typeInputs, typeKeySeenInside) =>
                            heuristicObject.values.fromToken(
                                // If it's another input type then just return another empty function
                                typeInputs[token.inputType],
                                typeKeySeenInside // Not sure about this
                            ),
                    ];
                if (token.genericType)
                    return [
                        runFunctionOrValue(initialPatternValue),
                        // ({ genericTypeMap }) =>
                        //     heuristicObject.values.fromTypeToken(
                        //         genericTypeMap[token.genericType]
                        //     ),
                    ]; // Needs to then iterate and combine pattern heuristics over all possible generics

                // Standard type
                if (!token.metaType) {
                    const [fastValue, slowValue] =
                        heuristicObject.values.fromTypeToken(
                            token,
                            typeKeySeen
                        );

                    return [
                        fastValue,
                        slowValue ? () => slowValue(token.subtypes) : undefined,
                    ];
                }

                // Assume metatype
                switch (token.metaType) {
                    case "or":
                        return heuristicObject.values.fromPatternList(
                            token.patterns,
                            typeKeySeen
                        );
                    case "multi":
                        const getValue = () =>
                            heuristicObject.values.fromPattern(
                                token.pattern,
                                typeKeySeen
                            );
                        // Max and min had extra rules here that I didnt wanna get rid of,
                        //   passing this in as a function is only a slight optimization.
                        // (Doesn't need to run if the min/max is == 0)
                        if (getMultiMetatypeValue)
                            return getMultiMetatypeValue(token, getValue);

                        return getValue();

                    case "anychar":
                        return [getTokenDictValue(token)];
                    case "subcontext":
                        return heuristicObject.values.fromSubcontext(
                            token,
                            typeKeySeen
                        );
                }
            },
            fromPattern: (pattern, typeKeySeen) => {
                let currentValue = [runFunctionOrValue(initialPatternValue)];
                for (let i = 0; i < pattern.length; i++) {
                    // End tokendict needs to go in opposite direction
                    const token =
                        pattern[
                            patternReverseOrder ? pattern.length - 1 - i : i
                        ];
                    currentValue = combineTokenValues(
                        currentValue,
                        heuristicObject.values.fromToken(token, typeKeySeen)
                    );

                    if (killPattern(currentValue, token)) break;
                }
                return currentValue;
            },
            fromPatternList: (patternList, typeKeySeen) => {
                let value = [runFunctionOrValue(initialTokenValue)];
                for (const pattern of patternList) {
                    value = combinePatternValues(
                        value,
                        heuristicObject.values.fromPattern(pattern, typeKeySeen)
                    );
                    if (killPatternList(value)) break;
                }
                return value;
            },
            fromSubcontext: (subcontextToken, typeKeySeen) => {
                if (context.parentContexts[subcontextToken.subcontextId])
                    return heuristicObject.values.fromPattern(
                        subcontextToken.pattern,
                        typeKeySeen
                    );

                return subcontextToken
                    .getSubcontext()
                    .heuristics[heuristicName].values.fromPattern(
                        subcontextToken.pattern
                        // , typeKeySeen (Dont use same seen dict in subcontext, let it generate its own)
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
