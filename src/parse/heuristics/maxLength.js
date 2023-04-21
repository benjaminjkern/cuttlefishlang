import { consoleWarn } from "../../util/environment";
import { newHeuristic } from "./heuristic";

export const maxLengthHeuristic = newHeuristic({
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
            consoleWarn(
                "You have a multi token with a max length of 0, this should probably never happen."
            );
            return 0;
        }
        return getValue() * metatypeToken.max;
    },
    test: (expression, maxLength) => expression.length < maxLength,
    killPatternList: (max) => max >= Number.MAX_SAFE_INTEGER,
    killPattern: (currentLength) => currentLength >= Number.MAX_SAFE_INTEGER,
});
