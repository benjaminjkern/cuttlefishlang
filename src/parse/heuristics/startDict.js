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
    test: (expression, dict) => isValidToken(dict, expression[0]),
    killPattern: (_, token) =>
        context.heuristics.minLength.values.fromToken(token) === 0,
}));
