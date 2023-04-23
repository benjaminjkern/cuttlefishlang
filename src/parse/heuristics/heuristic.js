import { getAllRules, makeTypeKey } from "../genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
} from "../parsingUtils.js";
import { colorString, runFunctionOrValue } from "../../util/index.js";
import { type } from "../ruleUtils.js";

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

    const typeValues = {};
    let cache = {};
    let unresolved = {};

    const heuristicObject = {
        heuristicName,
        values: {
            fromType: (typeToken) => {
                const typeKey = makeTypeKey(typeToken);
                if (cache[typeKey] !== undefined) return cache[typeKey];
                if (unresolved[typeKey]) {
                    return runFunctionOrValue(unresolvedValue);
                }
                unresolved[typeKey] = true;
                cache[typeKey] = heuristicObject.values.fromPatternList(
                    getAllRules(typeToken, context).map(
                        ({ pattern }) => pattern
                    )
                );
                return cache[typeKey];
            },
            fromToken: (token) => {
                if (isTerminal(token)) return getTerminalTokenValue(token);
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
            fromPattern: (pattern) => {
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

                const typeKey = makeTypeKey(typeToken);
                return (
                    test(expression, typeValues[typeKey]) || {
                        error: `"${expression}" failed the heuristic test "${heuristicName}" for type: ${stringifyToken(
                            typeToken
                        )}!`,
                        value: typeValues[typeKey],
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

    // Fetch all
    for (const typeName in context.rules) {
        cache = { ...typeValues };
        unresolved = {};
        typeValues[typeName] = heuristicObject.values.fromType(type(typeName));

        // Check and warn of any issues (Only really used by minLength)
        finalCheck(typeValues[typeName], typeName);
    }
    return heuristicObject;
};
