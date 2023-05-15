import { getAllRules, makeTypeKey } from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
    stringifyTokenDict,
} from "../parsingUtils.js";
import {
    cacheValue,
    debugFunction,
    runFunctionOrValue,
} from "../../util/index.js";
import { genericType, thisSubtype, type } from "../ruleUtils.js";

// const lazyCombiner =
//     (combiner) =>
//     ([currentValueFast, currentValueSlow], [newValueFast, newValueSlow]) => {
//         return [
//             combiner(currentValueFast, newValueFast),
//             currentValueSlow || newValueSlow
//                 ? (...args) => {
//                       if (!currentValueSlow) return newValueSlow(...args);
//                       if (!newValueSlow) return currentValueSlow(...args);
//                       return combiner(
//                           currentValueSlow(...args),
//                           newValueSlow(...args)
//                       );
//                   }
//                 : undefined,
//         ];
//     };

const lazyCombiner = (combiner) => (currentValue, newValue) => {
    if (typeof currentValue !== "function" && typeof newValue !== "function")
        return combiner(currentValue, newValue);
    return (...args) =>
        combiner(
            runFunctionOrValue(currentValue, ...args),
            runFunctionOrValue(newValue, ...args)
        );
};

// export const transformHeuristicValue = ([fastValue, slowValue], transform) => {
//     return [
//         transform(fastValue),
//         slowValue
//             ? (inputTypes) => transform(slowValue(inputTypes))
//             : undefined,
//     ];
// };

const stringifyResult = (heuristicName) => (result) => {
    if (heuristicName[0] === "m") return result;
    return `[ ${stringifyTokenDict(result[0])}, ${result[1] && "()"}]`;
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

    const typeKeyValues = {};

    const heuristicObject = {
        heuristicName,
        values: {
            fromTypeToken: debugFunction(
                (typeToken, typeKeySeen) => {
                    // Add default subtypes (TODO: Allow different subtypes other than Object)
                    const adjustedTypeToken = {
                        ...typeToken,
                        subtypes: Array(context.generics.subtypeLengths || 0)
                            .fill()
                            .map(
                                (_, i) =>
                                    typeToken.subtypes[i] || type("Object")
                            ),
                    };
                    const typeKey = makeTypeKey(adjustedTypeToken);

                    if (typeKeyValues[typeKey]) return typeKeyValues[typeKey];
                    if (typeKeySeen?.[typeKey])
                        return runFunctionOrValue(unresolvedValue);

                    const value = heuristicObject.values.fromPatternList(
                        getAllRules(adjustedTypeToken, context).map(
                            ({ pattern }) => pattern
                        ),
                        { ...(typeKeySeen || {}), [typeKey]: true }
                    );

                    if (!typeKeySeen) {
                        typeKeyValues[typeKey] = value;
                        finalCheck(value, typeKey);
                    }

                    return value;
                },
                "fromTypeToken",
                [stringifyToken],
                stringifyResult(heuristicName)
            ),
            fromPatternList: (patternList, typeKeySeen) => {
                let value = runFunctionOrValue(initialTokenValue);
                for (const pattern of patternList) {
                    value = combinePatternValues(
                        value,
                        heuristicObject.values.fromPattern(pattern, typeKeySeen)
                    );
                    if (killPatternList(value)) break;
                }
                return value;
            },
            fromPattern: debugFunction(
                (pattern, typeKeySeen) => {
                    let currentValue = runFunctionOrValue(initialPatternValue);
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
                "fromPattern",
                [stringifyPattern],
                stringifyResult(heuristicName)
            ),
            fromToken: (token, typeKeySeen) => {
                if (isTerminal(token)) return getTerminalTokenValue(token);

                // Generic types
                if (token.thisType)
                    throw "Should have been handled in the getAllRules()";
                if (token.thisSubtype !== undefined)
                    throw "Should have been handled in the getAllRules()";

                if (token.inputType !== undefined)
                    return (typeInputs, typeKeySeenInside) =>
                        heuristicObject.values.fromToken(
                            // If it's another input type then just return another empty function
                            typeInputs[token.inputType],
                            typeKeySeenInside // Not sure about this
                        );
                if (token.genericType)
                    return runFunctionOrValue(initialPatternValue);
                // ({ genericTypeMap }) =>
                //     heuristicObject.values.fromTypeToken(
                //         genericTypeMap[token.genericType]
                //     ),
                // Needs to then iterate and combine pattern heuristics over all possible generics

                // Standard type
                if (!token.metaType) {
                    return heuristicObject.values.fromTypeToken(
                        token,
                        typeKeySeen
                    );
                }

                // Assume metatype here
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
                        return getTokenDictValue(token);
                    case "subcontext":
                        return heuristicObject.values.fromSubcontext(
                            token,
                            typeKeySeen
                        );
                }
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
        typeKeyValues,
    };
    return heuristicObject;
};
