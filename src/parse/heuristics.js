const makeHeuristics = (rules) => {
    const heuristics = {};
    for (const type in rules) {
        heuristics[type] = getHeuristicObject(type, rules, heuristics);
    }
    return heuristics;
};

const getHeuristicObject = (type, rules, heuristics) => {
    if (heuristics[type]) return heuristics[type];
    heuristics[type] = {
        minLength: Number.MAX_SAFE_INTEGER,
        maxLength: 0,
        dict: {},
        startTokens: {},
        endTokens: {},
    };

    for (const rule of rules[type]) {
        let ruleMinLength = 0;
        let ruleMaxLength = 0;
        let doneWithStartTokens = false;
        let runningEndTokens = {};
        for (const [idx, token] of rule.pattern.entries()) {
            if (isTerminal(token)) {
                if (idx === 0) heuristics[type].startTokens[token[0]] = true;
                if (idx === rule.pattern.length - 1)
                    heuristics[type].endTokens[token[token.length - 1]] = true;

                for (const char of token) {
                    heuristics[type].dict[char] = true;
                }

                ruleMinLength += token.length;
                ruleMaxLength += token.length;
                continue;
            }
            if (token.type === type) {
                // Its not actually the ruleMinLength, but it needs to know that this rule will not be the minimum so it should ignore it
                ruleMaxLength = ruleMinLength = Number.MAX_SAFE_INTEGER;
                continue;
            }
            const tokenHeuristics = getHeuristicObject(
                token.type,
                rules,
                heuristics
            );
            ruleMaxLength += tokenHeuristics.maxLength;
            ruleMinLength += tokenHeuristics.minLength;
            if (!doneWithStartTokens) {
                if (tokenHeuristics.minLength !== 0) doneWithStartTokens = true;

                heuristics[type].startTokens = {
                    ...heuristics[type].startTokens,
                    ...tokenHeuristics.startTokens,
                };
            }

            if (tokenHeuristics.minLength === 0) {
                runningEndTokens = {
                    ...runningEndTokens,
                    ...tokenHeuristics.endTokens,
                };
            } else {
                runningEndTokens = tokenHeuristics.endTokens;
            }

            if (idx === rule.pattern.length - 1) {
                heuristics[type].endTokens = {
                    ...heuristics[type].endTokens,
                    ...runningEndTokens,
                };
            }

            if (token.type !== type)
                heuristics[type].dict = {
                    ...heuristics[type].dict,
                    ...tokenHeuristics.dict,
                };
        }

        if (ruleMinLength < heuristics[type].minLength)
            heuristics[type].minLength = Math.min(
                Number.MAX_SAFE_INTEGER,
                ruleMinLength
            );
        if (ruleMaxLength > heuristics[type].maxLength)
            heuristics[type].maxLength = Math.min(
                Number.MAX_SAFE_INTEGER,
                ruleMaxLength
            );
    }
    return heuristics[type];
};

const isTerminal = (token) =>
    typeof token !== "object" || !token.type || !RULES[token.type];

const RULES = {
    N: [
        {
            pattern: [{ type: "N" }, "-", { type: "N" }],
        },
        {
            pattern: [{ type: "N" }, { type: "N" }],
        },
        {
            pattern: ["-", { type: "N" }],
        },
        {
            pattern: ["n"],
        },
    ],
    String: [
        {
            pattern: ['"', { type: "Stringinnerts" }, '"'],
        },
        {
            pattern: ["print", { type: "String" }],
        },
    ],
    Stringinnerts: [
        {
            pattern: ["a", { type: "Stringinnerts" }],
        },
        {
            pattern: [],
        },
    ],
};

console.log(makeHeuristics(RULES));

module.exports = makeHeuristics;
