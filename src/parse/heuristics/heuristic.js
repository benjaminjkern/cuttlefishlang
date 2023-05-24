import {
    fillDefaultSubtypes,
    getAllRules,
    makeTypeKey,
} from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
    stringifyTokenDict,
} from "../parsingUtils.js";
import { debugFunction, runFunctionOrValue } from "../../util/index.js";
import { environment } from "../../util/environment.js";

const stringifyTestResult = (result) => {
    if (result.error) return `Error: ${result.error}`;
    return result;
    // return stringifyToken(result);
};

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
        stopIteratingPattern = () => false,
        patternReverseOrder = false,
        finalCheck = () => {},
        allowAllEmptyExpressions = true,
    } = runFunctionOrValue(contextWrapper, context);

    const typeKeyValues = {};

    const heuristicObject = {
        heuristicName,
        values: {
            fromTypeToken: debugFunction(
                (typeToken, typeSeen) => {
                    const adjustedTypeToken = fillDefaultSubtypes(
                        typeToken,
                        context
                    );
                    const typeKey = makeTypeKey(adjustedTypeToken);

                    if (typeKeyValues[typeKey]) return typeKeyValues[typeKey];
                    if (typeSeen?.[adjustedTypeToken.type])
                        return runFunctionOrValue(unresolvedValue);

                    const value = heuristicObject.values.fromPatternList(
                        getAllRules(adjustedTypeToken, context).map(
                            ({ pattern }) => pattern
                        ),
                        { ...(typeSeen || {}), [adjustedTypeToken.type]: true }
                    );

                    if (!typeSeen) {
                        typeKeyValues[typeKey] = value;
                        finalCheck(value, typeKey);
                    }

                    return value;
                },
                `${heuristicName}.fromTypeToken`,
                [stringifyToken],
                stringifyResult(heuristicName),
                environment.debugHeuristics
            ),
            fromPatternList: (patternList, typeSeen) => {
                let value = runFunctionOrValue(initialTokenValue);

                for (const pattern of patternList) {
                    const newValue = heuristicObject.values.fromPattern(
                        pattern,
                        value,
                        typeSeen
                    );
                    value = combinePatternValues(value, newValue);
                    if (killPatternList(value)) return value;
                }
                return value;
            },
            fromPattern: debugFunction(
                (pattern, breakValue, typeSeen) => {
                    let currentValue = runFunctionOrValue(initialPatternValue);
                    for (let i = 0; i < pattern.length; i++) {
                        // End tokendict needs to go in opposite direction
                        const token =
                            pattern[
                                patternReverseOrder ? pattern.length - 1 - i : i
                            ];
                        const newValue = heuristicObject.values.fromToken(
                            token,
                            typeSeen
                        );
                        currentValue = combineTokenValues(
                            currentValue,
                            newValue
                        );

                        if (killPattern(currentValue, breakValue))
                            return currentValue;

                        if (stopIteratingPattern(token)) break; // Should only need to do this here
                    }
                    return currentValue;
                },
                `${heuristicName}.fromPattern`,
                [stringifyPattern],
                stringifyResult(heuristicName),
                environment.debugHeuristics
            ),
            fromToken: (token, typeSeen) => {
                if (isTerminal(token)) return getTerminalTokenValue(token);

                if (token.thisType)
                    throw "Should have been handled in the getAllRules()";
                if (token.thisSubtype !== undefined)
                    throw "Should have been handled in the getAllRules()";

                // Generic types
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
                        typeSeen
                    );
                }

                // Assume metatype here
                switch (token.metaType) {
                    case "or":
                        return heuristicObject.values.fromPatternList(
                            token.patterns,
                            typeSeen
                        );
                    case "multi":
                        const getValue = () =>
                            heuristicObject.values.fromPattern(
                                token.pattern,
                                undefined,
                                typeSeen
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
                            typeSeen
                        );
                }
            },
            fromSubcontext: (subcontextToken, typeSeen) => {
                if (context.parentContexts[subcontextToken.subcontextId])
                    return heuristicObject.values.fromPattern(
                        subcontextToken.pattern,
                        undefined,
                        typeSeen
                    );

                return subcontextToken
                    .getSubcontext()
                    .heuristics[heuristicName].values.fromPattern(
                        subcontextToken.pattern
                        // , typeSeen (Dont use same seen dict in subcontext, let it generate its own)
                    );
            },
        },
        tests: {
            fromTypeToken: debugFunction(
                (typeToken, expression) => {
                    // Wasnt in original heuristic check but might as well be?
                    if (allowAllEmptyExpressions && expression.length === 0)
                        return true;

                    const value =
                        heuristicObject.values.fromTypeToken(typeToken);

                    return (
                        test(expression, value) || {
                            error: `"${expression}" failed the heuristic test "${heuristicName}" for type: ${stringifyToken(
                                typeToken
                            )}!`,
                            value,
                        }
                    );
                },
                `${heuristicName}.tests.fromTypeToken`,
                [stringifyToken, stringifyToken],
                stringifyTestResult,
                environment.debugHeuristicTests
            ),
            fromPattern: debugFunction(
                (pattern, expression) => {
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
                `${heuristicName}.tests.fromPattern`,
                [stringifyPattern, stringifyToken],
                stringifyTestResult,
                environment.debugHeuristicTests
            ),
        },
        typeKeyValues,
    };
    return heuristicObject;
};
