import { getAllRules, makeTypeKey } from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
} from "../parsingUtils.js";
import { debugFunction, runFunctionOrValue } from "../../util/index.js";
import { type } from "../ruleUtils.js";

const patternListHasSubtypeReferences = (patternList) => {
    return patternList.some(patternHasSubtypeReferences);
};

const patternHasSubtypeReferences = (pattern) => {
    return pattern.some(tokenHasSubtypeReferences);
};

const tokenHasSubtypeReferences = (token) => {
    if (token.thisSubtype !== undefined) return true;
    if (token.metaType) {
        switch (token.metaType) {
            case "or":
                return patternListHasSubtypeReferences(token.patterns);
            case "multi":
                return patternHasSubtypeReferences(token.pattern);
            case "anychar":
                return false;
            case "subcontext":
                return patternHasSubtypeReferences(token.pattern);
        }
    }
    // All other cases (thistype, generictype, raw types, terminal tokens)
    return false;
};

const lazyCombiner = (combiner) => (value, newValue) => {
    if (typeof value !== "function" && typeof newValue !== "function")
        return combiner(value, newValue);
    return (...args) =>
        combiner(
            runFunctionOrValue(value, ...args),
            runFunctionOrValue(newValue, ...args)
        );
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
            fromType: debugFunction(
                (typeToken) => {
                    // (Maybe can be done in a different way in the future, but this is to prevent passing the unresolved and cache down every single call)
                    const scopeTopLevel = topLevel;

                    if (scopeTopLevel) {
                        topLevel = false;
                        unresolved = {};
                        cache = { ...typeValues };
                    }

                    const typeName = typeToken.type;

                    if (cache[typeName] !== undefined) {
                        if (scopeTopLevel) topLevel = true;
                        return runFunctionOrValue(cache[typeName], {
                            typeToken,
                        });
                    }

                    if (unresolved[typeName])
                        return runFunctionOrValue(unresolvedValue);
                    unresolved[typeName] = true;

                    cache[typeName] = heuristicObject.values.fromPatternList(
                        // Force it to get the ROOT rules, independent of subtypes
                        getAllRules(type(typeToken.type), context, false).map(
                            ({ pattern }) => pattern
                        )
                    );

                    if (scopeTopLevel) {
                        typeValues[typeName] = cache[typeName];
                        // Check and warn of any issues (Only really used by minLength)
                        finalCheck(typeValues[typeName], typeName);
                        topLevel = true;
                    }

                    return runFunctionOrValue(cache[typeName], { typeToken });
                },
                "fromType",
                [stringifyToken]
            ),
            fromToken: (token) => {
                if (isTerminal(token)) return getTerminalTokenValue(token);

                // Generic types
                if (token.thisType)
                    return ({ typeToken }) =>
                        heuristicObject.values.fromType(typeToken);
                if (token.thisSubtype !== undefined)
                    return ({ typeToken }) =>
                        heuristicObject.values.fromType(
                            typeToken.subtypes[token.thisSubtype]
                        );
                if (token.genericType)
                    return ({ genericTypeMap }) =>
                        heuristicObject.values.fromType(
                            genericTypeMap[token.genericType]
                        ); // Needs to then iterate and combine pattern heuristics over all possible generics

                // standard type
                if (!token.metaType)
                    return heuristicObject.values.fromType(token);

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
                        return getTokenDictValue(token);
                    case "subcontext":
                        return heuristicObject.values.fromSubcontext(token);
                }
            },
            fromPattern: debugFunction(
                (pattern) => {
                    let currentValue = runFunctionOrValue(initialPatternValue);
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
                let value = runFunctionOrValue(initialTokenValue);
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
            fromType: (typeToken, expression) => {
                // Wasnt in original heuristic check but might as well be?
                if (allowAllEmptyExpressions && expression.length === 0)
                    return true;
                const value = heuristicObject.values.fromType(typeToken);
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
