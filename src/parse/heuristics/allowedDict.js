import { newHeuristic } from "./heuristic.js";
import { addTokenDicts, isValidToken, newTokenDict } from "./tokenDict.js";

export const allowedCharactersHeuristic = newHeuristic({
    heuristicName: "allowedCharacters",
    initialTokenValue: newTokenDict,
    initialPatternValue: newTokenDict,
    unresolvedValue: newTokenDict,
    combinePatternValues: addTokenDicts,
    combineTokenValues: addTokenDicts,
    getTerminalTokenValue: (token) => token,
    getTokenDictValue: (token) => token.tokenDict,
    test: (expression, tokenDict) => {
        for (const token of expression) {
            if (!isValidToken(tokenDict, token)) return false;
        }
        return true;
    },
    killPatternList: ([dict]) =>
        dict.blacklist && !Object.keys(dict.blacklist).length, // If already accepting all possible characters stop looking
    killPattern: ([dict]) =>
        dict.blacklist && !Object.keys(dict.blacklist).length, // If already accepting all possible characters stop looking
});
