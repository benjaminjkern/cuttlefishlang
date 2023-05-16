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
    evaluteToCompletion,
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
    if (typeof result === "function") return "( Callback Function )";
    return stringifyTokenDict(result);
};

export const newHeuristic = (contextWrapper) => (context) => {
    // Needed to be able to give the newHeuristic access to the context so that it can depend on other heuristics if it wants to
    const {
        heuristicName,
        initialTokenValue,
        initialPatternValue,
        unresolvedValue,
        combinePatternValues,
        combineTokenValues,
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

    const typeKeyValues = {};

    const heuristicObject = {
        heuristicName,
        values: {
            fromTypeToken: debugFunction(
                (typeToken, typeKeySeen) => {
                    // Add default subtypes (TODO: Allow different subtypes other than Object)
                    const adjustedTypeToken = {
                        ...typeToken,
                        subtypes: Array(
                            context.generics.subtypeLengths[typeToken.type] || 0
                        )
                            .fill()
                            .map(
                                (_, i) =>
                                    typeToken.subtypes[i] || type("Object")
                            ),
                    };
                    const typeKey = makeTypeKey(adjustedTypeToken);

                    if (typeKeyValues[typeKey]) {
                        typeKeyValues[typeKey] = runFunctionOrValue(
                            typeKeyValues[typeKey]
                        );
                        return typeKeyValues[typeKey];
                    }
                    if (typeKeySeen?.[typeKey])
                        return runFunctionOrValue(unresolvedValue);

                    // Allow patterns to finish getting the rest of the value in order to test for breakValue happening first.
                    // This is required for breaking recursive subtypes ($ -> A<$>)
                    return debugFunction(
                        () => {
                            const value =
                                heuristicObject.values.fromPatternList(
                                    getAllRules(adjustedTypeToken, context).map(
                                        ({ pattern }) => pattern
                                    ),
                                    undefined,
                                    { ...(typeKeySeen || {}), [typeKey]: true }
                                );

                            if (!typeKeySeen) {
                                typeKeyValues[typeKey] = value;
                                finalCheck(value, typeKey);
                            }

                            return value;
                        },
                        `${heuristicName}.fromTypeTokenCallback ${stringifyToken(
                            typeToken
                        )}`,
                        [],
                        stringifyResult(heuristicName)
                    );
                },
                `${heuristicName}.fromTypeToken`,
                [stringifyToken],
                stringifyResult(heuristicName)
            ),
            fromPatternList: (patternList, typeKeySeen) => {
                let value = runFunctionOrValue(initialTokenValue);

                const delayedValues = [];
                for (const pattern of patternList) {
                    const newValue = heuristicObject.values.fromPattern(
                        pattern,
                        value,
                        typeKeySeen
                    );

                    if (typeof newValue === "function")
                        delayedValues.push(newValue);
                    else value = combinePatternValues(value, newValue);
                    if (killPatternList(value)) return value;
                }

                if (delayedValues.length) {
                    return debugFunction(
                        () => {
                            while (delayedValues.length) {
                                const delayedValue = delayedValues.shift(); // TODO: Use a better data structure that is faster

                                const newValue = delayedValue();
                                if (typeof newValue === "function")
                                    delayedValues.push(newValue);
                                else
                                    value = combinePatternValues(
                                        value,
                                        newValue
                                    );
                                if (killPatternList(value)) break;
                            }
                            return value;
                        },
                        `${heuristicName}.fromPatternListCallback`,
                        [],
                        stringifyResult(heuristicName)
                    );
                }
                return value;
            },
            fromPattern: debugFunction(
                (pattern, breakValue, typeKeySeen) => {
                    let currentValue = runFunctionOrValue(initialPatternValue);
                    const delayedValues = [];
                    for (let i = 0; i < pattern.length; i++) {
                        // End tokendict needs to go in opposite direction
                        const token =
                            pattern[
                                patternReverseOrder ? pattern.length - 1 - i : i
                            ];
                        const newValue = heuristicObject.values.fromToken(
                            token,
                            typeKeySeen
                        );
                        if (typeof newValue === "function")
                            delayedValues.push([token, newValue]);
                        else
                            currentValue = combineTokenValues(
                                currentValue,
                                newValue
                            );

                        if (killPattern(currentValue, token, breakValue))
                            return currentValue;
                    }

                    if (delayedValues.length) {
                        return debugFunction(
                            () => {
                                while (delayedValues.length) {
                                    const [token, delayedValue] =
                                        delayedValues.shift(); // TODO: Use a better data structure that is faster

                                    const newValue = delayedValue();
                                    if (typeof newValue === "function")
                                        delayedValues.push([token, newValue]);
                                    else
                                        currentValue = combineTokenValues(
                                            currentValue,
                                            newValue
                                        );
                                    if (
                                        killPattern(
                                            currentValue,
                                            token,
                                            breakValue
                                        )
                                    )
                                        break;
                                }
                                return currentValue;
                            },
                            `${heuristicName}.fromPatternCallback ${stringifyPattern(
                                pattern
                            )}`,
                            [],
                            stringifyResult(heuristicName)
                        );
                    }
                    return currentValue;
                },
                `${heuristicName}.fromPattern`,
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

                if (token.inputType !== undefined) throw "Need to fix this";
                // return (typeInputs, typeKeySeenInside) =>
                //     heuristicObject.values.fromToken(
                //         // If it's another input type then just return another empty function
                //         typeInputs[token.inputType],
                //         typeKeySeenInside // Not sure about this
                //     );
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
                            evaluteToCompletion(
                                // TODO: This might not be good to be a evalute-to-completion here
                                heuristicObject.values.fromPattern(
                                    token.pattern,
                                    undefined,
                                    typeKeySeen
                                )
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
                        undefined,
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

                const value = evaluteToCompletion(
                    heuristicObject.values.fromTypeToken(typeToken)
                );

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

                const value = evaluteToCompletion(
                    heuristicObject.values.fromPattern(pattern)
                );

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
