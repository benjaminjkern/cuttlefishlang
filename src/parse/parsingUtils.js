export const isTerminal = (token) => typeof token !== "object";

export const stringifyPattern = (pattern) => {
    return pattern
        .map((token) => {
            if (token.type) return `{Type: ${token.type}}`;
            if (token.metaType) {
                switch (token.metaType) {
                    case "or":
                        return `{${token.patterns
                            .map(stringifyPattern)
                            .join(" | ")}}`;
                    case "multi":
                        return `{Multi: ${stringifyPattern(token.pattern)}: {${
                            token.min
                        }, ${token.max}}}`;
                    case "anychar":
                        return `{CharDict: ${stringifyTokenDict(
                            token.tokenDict
                        )}}`;
                }
            }
            return token;
        })
        .join("");
};

export const stringifyTokenDict = (tokenDict) => {
    if (tokenDict.whitelist) return Object.keys(tokenDict.whitelist).join("");
    return `NOT ${Object.keys(tokenDict.blacklist).join("")}`;
};
