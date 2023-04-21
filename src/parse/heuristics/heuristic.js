import { getAllRules } from "../genericUtils.js";
import { isTerminal, stringifyPattern } from "../parsingUtils.js";
import { runFunctionOrValue } from "../../util/index.js";

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
    } = runFunctionOrValue(contextWrapper, context);

    const typeValues = {};
    const unresolved = {};

    const heuristicObject = {
        heuristicName,
        values: {
            fromType: (type) => {
                if (typeValues[type] !== undefined) return typeValues[type];
                if (unresolved[type]) {
                    typeValues[type] = runFunctionOrValue(unresolvedValue);
                    return typeValues[type];
                }
                unresolved[type] = true;
                typeValues[type] = heuristicObject.values.fromPatternList(
                    getAllRules(type, context).map(({ pattern }) => pattern)
                );
                return typeValues[type];
            },
            fromToken: (token) => {
                if (isTerminal(token)) return getTerminalTokenValue(token);
                if (!token.metaType)
                    return heuristicObject.values.fromType(token.type);

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
                console.log(currentValue);
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
                    .heuristics.minLength.values.fromPattern(
                        subcontextToken.pattern
                    );
            },
        },
        tests: {
            fromType: (type, expression) => {
                return (
                    test(expression, typeValues[type]) || {
                        error: `"${expression}" failed the heuristic test ${heuristicName} for type: ${type}!`,
                    }
                );
            },
            fromPattern: (pattern, expression) => {
                return (
                    test(
                        expression,
                        heuristicObject.values.fromPattern(pattern)
                    ) || {
                        error: `"${expression}" failed the heuristic test ${heuristicName} for meta-type: ${stringifyPattern(
                            pattern
                        )}!"`,
                    }
                );
            },
        },
    };

    // Fetch all
    for (const type in context.rules) {
        typeValues[type] = heuristicObject.values.fromType(type);

        // Check and warn of any issues (Only really used by minLength)
        finalCheck(typeValues[type], type);
    }
    return heuristicObject;
};
