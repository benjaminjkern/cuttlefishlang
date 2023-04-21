import { newHeuristic } from "./heuristic.js";
import { addTokenDicts, isValidToken, newTokenDict } from "./tokenDict.js";

export const allowedEndCharactersHeuristic = newHeuristic((context) => ({
    heuristicName: "allowedEndCharacters",
    initialTokenValue: newTokenDict,
    initialPatternValue: newTokenDict,
    unresolvedValue: newTokenDict,
    combinePatternValues: addTokenDicts,
    combineTokenValues: addTokenDicts,
    getTerminalTokenValue: (token) => token[token.length - 1],
    getTokenDictValue: (token) => token.tokenDict,
    test: (expression, dict) =>
        isValidToken(dict, expression[expression.length - 1]),
    killPatternList: (dict) =>
        dict.blacklist && !Object.keys(dict.blacklist).length, // If already accepting all possible characters stop looking
    killPattern: (dict, token) => {
        if (dict.blacklist && !Object.keys(dict.blacklist).length) return true;
        return context.heuristics.minLength.values.fromToken(token) > 0;
    },
    patternReverseOrder: true,
}));
