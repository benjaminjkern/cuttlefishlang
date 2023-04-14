export const isTerminal = (token) => typeof token !== "object";

export const stringifyPattern = (
    pattern,
    topLevel = true,
    hideSpaces = true
) => {
    return (
        (topLevel ? `[`.magenta : "") +
        pattern
            .map((token) => {
                if (token.type) return `{${token.type}}`.red;
                if (token.metaType) {
                    switch (token.metaType) {
                        case "or":
                            return (
                                `(`.green +
                                `${token.patterns
                                    .map((pattern) =>
                                        stringifyPattern(pattern, false)
                                    )
                                    .join(" | ".green)}` +
                                `)`.green
                            );
                        case "multi":
                            if (token.pattern[0].type === "space" && hideSpaces)
                                return " ";
                            const stringifiedPattern = stringifyPattern(
                                token.pattern,
                                false
                            );
                            if (token.max >= Number.MAX_SAFE_INTEGER) {
                                if (token.min === 0)
                                    return stringifiedPattern + "*".yellow;
                                if (token.min === 1)
                                    return stringifiedPattern + "+".yellow;
                                return (
                                    stringifiedPattern + `{${token.min}}`.yellow
                                );
                            }
                            if (token.max === 1) {
                                if (token.min !== 0)
                                    throw "Weird multi metatype: min=${token.min} max=1";
                                return stringifiedPattern + "?".yellow;
                            }
                            return (
                                stringifiedPattern +
                                `{${token.min}, ${token.max}}`.yellow
                            );
                        case "anychar":
                            return `[${stringifyTokenDict(token.tokenDict)}]`
                                .blue;
                    }
                }
                return token;
            })
            .join("") +
        (topLevel ? `]`.magenta : "")
    );
};

export const stringifyTokenDict = (tokenDict) => {
    if (tokenDict.whitelist) return Object.keys(tokenDict.whitelist).join("");
    return `NOT ${Object.keys(tokenDict.blacklist).join("")}`;
};
