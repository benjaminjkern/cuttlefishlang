import { colorString } from "../util/index.js";
import { newTokenDict } from "./heuristics/tokenDict.js";

export const isTerminal = (token) => typeof token !== "object";

export const stringifyPattern = (
    pattern,
    topLevel = true,
    hideSpaces = true
) => {
    return (
        (topLevel ? colorString("[", "magenta") : "") +
        pattern.map((token) => stringifyToken(token, hideSpaces)).join("") +
        (topLevel ? colorString("]", "magenta") : "")
    );
};

export const stringifyToken = (token, hideSpaces = false) => {
    if (Array.isArray(token)) return stringifyPattern(token, false, hideSpaces);

    if (token.type) return colorString(`{${token.type}}`, "red");
    if (token.metaType) {
        switch (token.metaType) {
            case "or":
                return (
                    colorString("(", "green") +
                    `${token.patterns
                        .map((pattern) =>
                            stringifyPattern(pattern, false, hideSpaces)
                        )
                        .join(colorString(" | ", "green"))}` +
                    colorString(")", "green")
                );
            case "multi":
                if (token.pattern[0].type === "space" && hideSpaces) return " ";
                const stringifiedPattern = stringifyPattern(
                    token.pattern,
                    false,
                    hideSpaces
                );

                // NOTE: I'm hoping no one will put in a rule in above Number.MAX_SAFE_INTEGER / 2, lol
                // This is so it can be a bit below Number.MAX_SAFE_INTEGER and still render as an asterisk (Parsing sometimes sets it to Number.MAX_SAFE_INTEGER - 1)
                if (token.max >= Number.MAX_SAFE_INTEGER / 2) {
                    if (token.min === 0)
                        return stringifiedPattern + colorString("*", "yellow");
                    if (token.min === 1)
                        return stringifiedPattern + colorString("+", "yellow");
                    return (
                        stringifiedPattern +
                        colorString(`{${token.min}}`, "yellow")
                    );
                }
                if (token.max === 1) {
                    if (token.ignoreWeirdMulti) return stringifiedPattern;
                    if (token.min !== 0)
                        throw `Weird multi metatype: min=${token.min} max=1`;
                    return stringifiedPattern + colorString("?", "yellow");
                }
                return (
                    stringifiedPattern +
                    colorString(`{${token.min}, ${token.max}}`, "yellow")
                );
            case "anychar":
                return stringifyTokenDict(token.tokenDict);
            case "subcontext":
                return (
                    colorString("<", "red") +
                    stringifyPattern(token.pattern, false, hideSpaces) +
                    colorString(">", "red")
                );
            default:
                throw `Not implemented: Stringify metatype ${token.metaType}`;
        }
    }
    return `"${token}"`;
};

export const stringifyTokenDict = (tokenDict) => {
    if (tokenDict.whitelist)
        return colorString(
            `[${Object.keys(tokenDict.whitelist).join("")}]`,
            "blue"
        );
    if (tokenDict.blacklist)
        return colorString(
            `[${`NOT ${Object.keys(tokenDict.blacklist).join("")}`}]`,
            "blue"
        );
    // Assume its a string
    return stringifyTokenDict(newTokenDict(tokenDict));
};
