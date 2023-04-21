import { consoleWarn } from "../util/environment.js";
import { isTerminal, stringifyPattern } from "./parsingUtils.js";

import {
    newTokenDict,
    addToTokenDict,
    addTokenDicts,
    isValidToken,
} from "./tokenDict.js";

const generateHeuristics = (rules, generics, parentContexts) => {
    // This is so it can be accessed later by the start and end dict function
    const toAddHeuristics = {};

    const HEURISTICS = {
        types: {
            // [type]: {
            //     [heuristic]: value,
            // },
        },
        typeHeuristics: {
            // [heuristic]: (type, expression) => boolean,
        },
        metaTypeHeuristics: {
            // [heuristic]: (metaType, expression) => boolean,
        },
        patternHeuristics: {
            // [heuristic]: (pattern) => value,
        },
    };

    const context = { rules, generics, parentContexts }; // Its easier to toss this around than separately use the rules and generics

    toAddHeuristics.dict = getDicts(context);
    HEURISTICS.typeHeuristics.dict = (type, expression) => {
        for (const token of expression) {
            if (!isValidToken(HEURISTICS.types[type].dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for type: ${type}!`,
                };
        }
        return true;
    };
    HEURISTICS.metaTypeHeuristics.dict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let dict;
        switch (metaTypeToken.metaType) {
            case "or":
                dict = getPatternListDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.dict,
                    context
                );
                break;
            case "multi":
                dict = getPatternDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.dict,
                    context
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        for (const token of expression) {
            if (!isValidToken(dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for meta-type: ${stringifyPattern(
                        [metaTypeToken]
                    )}!`,
                };
        }
        return true;
    };

    toAddHeuristics.startDict = getStartDicts(context, toAddHeuristics);
    HEURISTICS.typeHeuristics.startDict = (type, expression) =>
        !isValidToken(HEURISTICS.types[type].startDict, expression[0]) && {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.startDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let startDict;
        switch (metaTypeToken.metaType) {
            case "or":
                startDict = getPatternListStartDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.startDict,
                    context,
                    toAddHeuristics
                );
                break;
            case "multi":
                startDict = getPatternStartDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.startDict,
                    context,
                    toAddHeuristics
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(startDict, expression[0]) && {
                error: `'${
                    expression[0]
                }' is not in the set of start tokens for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!`,
            }
        );
    };

    toAddHeuristics.endDict = getEndDicts(context, toAddHeuristics);
    HEURISTICS.typeHeuristics.endDict = (type, expression) =>
        !isValidToken(
            HEURISTICS.types[type].endDict,
            expression[expression.length - 1]
        ) && {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.endDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let endDict;
        switch (metaTypeToken.metaType) {
            case "or":
                endDict = getPatternListEndDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.endDict,
                    context,
                    toAddHeuristics
                );
                break;
            case "multi":
                endDict = getPatternEndDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.endDict,
                    context,
                    toAddHeuristics
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(endDict, expression[expression.length - 1]) && {
                error: `'${
                    expression[expression.length - 1]
                }' is not in the set of end tokens for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!"`,
            }
        );
    };

    // Attach each heuristic
    for (const type in rules) {
        HEURISTICS.types[type] = {};
        for (const heuristic in HEURISTICS.typeHeuristics) {
            HEURISTICS.types[type][heuristic] =
                toAddHeuristics[heuristic][type];
        }
    }
    return HEURISTICS;
};
