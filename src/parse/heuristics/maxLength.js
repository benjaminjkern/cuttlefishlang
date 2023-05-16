import { consoleWarn } from "../../util/environment.js";
import { newHeuristic } from "./heuristic.js";

export const maxLengthHeuristic = newHeuristic((context) => ({
    heuristicName: "maxLength",
    initialPatternValue: 0,
    initialTokenValue: 0,
    unresolvedValue: Number.MAX_SAFE_INTEGER,
    combineTokenValues: (current, newValue) => current + newValue,
    combinePatternValues: Math.max,
    getTerminalTokenValue: (token) => token.length,
    getTokenDictValue: () => 1,
    getMultiMetatypeValue: (metatypeToken, getValue) => {
        if (metatypeToken.max === 0) {
            if (!context.heuristicsGenerated)
                consoleWarn(
                    "You have a multi token with a max length of 0, this should probably never happen."
                );
            return [0];
        }
        return getValue() * metatypeToken.max;
    },
    test: (expression, maxLength) => expression.length <= maxLength,
    killPatternList: (value) => value >= Number.MAX_SAFE_INTEGER,
    killPattern: (value) => value >= Number.MAX_SAFE_INTEGER,
    allowAllEmptyExpressions: false,
}));
