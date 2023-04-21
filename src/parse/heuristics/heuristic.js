import { consoleWarn } from "../../util/environment";
import { getAllRules } from "./genericUtils.js";

export const newHeuristic =
    (
        initialTokenValue,
        initialPatternValue,
        combinePatterns,
        combineTokens,
        killPatternList
    ) =>
    (context) => {
        const typeValues = {};
        const parentCalls = {};

        const heuristicObject = {
            values: {
                fromType: (type) => {
                    if (typeValues[type] !== undefined) return typeValues[type];
                    if (parentCalls[type]) {
                        typeValues[type] = initialTokenValue;
                        return typeValues[type];
                    }
                    parentCalls[type] = true;
                    typeValues[type] = heuristicObject.values.fromPatternList(
                        getAllRules(type, context).map(({ pattern }) => pattern)
                    );
                    return typeValues[type];
                },
                fromPattern: (pattern) => {
                    let currentValue = initialPatternValue;
                    for (const token of pattern) {
                        if (isTerminal(token)) {
                            currentLength = combineTokenValues(
                                currentLength,
                                getTerminalTokenValue(token)
                            );
                            continue;
                        }
                        if (token.metaType) {
                            switch (token.metaType) {
                                case "or":
                                    currentValue = combineTokens(
                                        currentValue,
                                        heuristicObject.values.patternList(
                                            token.patterns
                                        )
                                    );
                                    break;
                                case "multi":
                                    if (token.min === 0) continue;
                                    currentLength +=
                                        getPatternMinLength(
                                            token.pattern,
                                            parentCalls,
                                            cache,
                                            context
                                        ) * token.min;
                                    break;
                                case "anychar":
                                    currentLength += 1;
                                    continue;
                                case "subcontext":
                                    currentLength += getSubcontextMinLength(
                                        token,
                                        parentCalls,
                                        cache,
                                        context
                                    );
                                    break;
                            }
                        } else {
                            currentLength += getTypeMinLength(
                                token.type,
                                { ...parentCalls },
                                cache,
                                context
                            );
                        }
                        if (currentLength >= Number.MAX_SAFE_INTEGER) {
                            return Number.MAX_SAFE_INTEGER;
                        }
                    }
                    return currentLength;
                },
                fromPatternList: (patternList) => {
                    let value = initialTokenValue;
                    for (const pattern of patternList) {
                        value = combinePatterns(
                            value,
                            heuristicObject.values.fromPattern(pattern)
                        );
                        if (killPatternList(value)) break;
                    }
                    return value;
                },
            },
            tests: {
                type: () => {},
                pattern: () => {},
                patternList: () => {},
            },
        };

        // Fetch all

        const minLengths = {};
        for (const type in context.rules) {
            minLengths[type] = heuristicObject.values.fromType(type);

            if (minLengths[type] >= Number.MAX_SAFE_INTEGER)
                consoleWarn(
                    `Warning: Type "${type}" has a minimum length of ${minLengths[type]} (Probably an unclosed rule loop)`
                );
        }
        // return minLengths;
    };
