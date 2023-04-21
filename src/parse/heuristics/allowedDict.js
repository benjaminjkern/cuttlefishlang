import { newHeuristic } from "./heuristic";
import { addTokenDicts, isValidToken, newTokenDict } from "./tokenDict";

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
});
