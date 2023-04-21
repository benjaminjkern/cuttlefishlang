import { newHeuristic } from "./heuristic.js";
import { addTokenDicts, isValidToken, newTokenDict } from "./tokenDict.js";

export const allowedStartCharactersHeuristic = newHeuristic((context) => ({
    heuristicName: "allowedStartCharacters",
    initialTokenValue: newTokenDict,
    initialPatternValue: newTokenDict,
    unresolvedValue: newTokenDict,
    combinePatternValues: addTokenDicts,
    combineTokenValues: addTokenDicts,
    getTerminalTokenValue: (token) => token[0],
    getTokenDictValue: (token) => token.tokenDict,
    test: (expression, dict) => {
        try {
            return isValidToken(dict, expression[0]);
        } catch (err) {
            console.log(dict, `'${expression}'`);
        }
    },
    killPatternList: (dict) =>
        dict.blacklist && !Object.keys(dict.blacklist).length, // If already accepting all possible characters stop looking
    killPattern: (dict, token) => {
        if (dict.blacklist && !Object.keys(dict.blacklist).length) return true;
        return context.heuristics.minLength.values.fromToken(token) > 0;
    },
}));
