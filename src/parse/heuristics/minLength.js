import { consoleWarn } from "../../util/environment.js";
import { newHeuristic } from "./heuristic.js";

export const minLengthHeuristic = newHeuristic({
    heuristicName: "minLength",
    initialTokenValue: Number.MAX_SAFE_INTEGER,
    initialPatternValue: 0,
    unresolvedValue: Number.MAX_SAFE_INTEGER,
    combinePatternValues: Math.min,
    combineTokenValues: (current, next) => current + next,
    getTerminalTokenValue: (token) => token.length,
    getTokenDictValue: () => 1,
    getMultiMetatypeValue: (metatypeToken, getValue) => {
        if (metatypeToken.min === 0) return [0];
        const [fastValue, slowValue] = getValue();
        return [
            fastValue * metatypeToken.min,
            slowValue
                ? (inputTypes) => slowValue(inputTypes) * metatypeToken.min
                : undefined,
        ];
    },
    test: (expression, minLength) => expression.length >= minLength,
    killPatternList: ([fastValue, slowValue]) =>
        fastValue === 0 && slowValue === undefined,
    killPattern: ([fastValue]) => fastValue >= Number.MAX_SAFE_INTEGER,
    finalCheck: (minLength, type) => {
        if (minLength >= Number.MAX_SAFE_INTEGER)
            consoleWarn(
                `Warning: Type "${type}" has a minimum length of ${minLength} (Probably an unclosed rule loop)`
            );
    },
    allowAllEmptyExpressions: false,
});
