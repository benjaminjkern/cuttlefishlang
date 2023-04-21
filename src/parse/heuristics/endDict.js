import { newHeuristic } from "./heuristic";
import { addTokenDicts, isValidToken, newTokenDict } from "./tokenDict";

export const allowedEndCharactersHeuristic = newHeuristic((context) => ({
    heuristicName: "allowedEndharacters",
    initialTokenValue: newTokenDict,
    initialPatternValue: newTokenDict,
    unresolvedValue: newTokenDict,
    combinePatternValues: addTokenDicts,
    combineTokenValues: addTokenDicts,
    getTerminalTokenValue: (token) => token[token.length - 1],
    getTokenDictValue: (token) => token.tokenDict,
    test: (expression, dict) =>
        isValidToken(dict, expression[expression.length - 1]),
    killPattern: (_, token) =>
        context.heuristics.minLength.values.fromToken(token) === 0,
    patternReverseOrder: true,
}));
