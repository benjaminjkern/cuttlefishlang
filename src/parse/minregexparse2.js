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
};

const isTerminal = (token) =>
    typeof token !== "object" || !token.type || !RULES[token.type];

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
        minLength: Number.MAX_VALUE,
        dict: {},
        startTokens: {},
        endTokens: {},
    };
    for (const rule of rules[type]) {
        if (rule.pattern.length < heuristics[type].minLength)
            heuristics[type].minLength = rule.pattern.length;
        for (const idx in rule.pattern) {
            const token = rule.pattern[idx];
            const terminal = isTerminal(token);
            if (idx - 0 === 0) {
                if (terminal) heuristics[type].startTokens[token] = true;
                else {
                    heuristics[type].startTokens["type:" + token.type] = true;
                    if (token.type !== type)
                        heuristics[type].startTokens = {
                            ...heuristics[type].startTokens,
                            ...getHeuristicObject(token.type, rules, heuristics)
                                .startTokens,
                        };
                }
            }
            if (idx - 0 === rule.pattern.length - 1) {
                if (terminal) heuristics[type].endTokens[token] = true;
                else {
                    heuristics[type].endTokens["type:" + token.type] = true;
                    if (token.type !== type)
                        heuristics[type].endTokens = {
                            ...heuristics[type].endTokens,
                            ...getHeuristicObject(token.type, rules, heuristics)
                                .endTokens,
                        };
                }
            }
            if (terminal) heuristics[type].dict[token] = true;
            else {
                heuristics[type].dict["type:" + token.type] = true;
                if (token.type !== type)
                    heuristics[type].dict = {
                        ...heuristics[type].dict,
                        ...getHeuristicObject(token.type, rules, heuristics)
                            .dict,
                    };
            }
        }
    }
    return heuristics[type];
};

const HEURISTICS = makeHeuristics(RULES);

const parseExpression = (pattern, expression) => {
    debugstart("parseExpression", [pattern, expression]);
    const possibleRegexes = allMatches(pattern, expression);
    if (possibleRegexes.length === 0) return debugreturn(false);
    for (const lengths of possibleRegexes) {
        if (
            pattern.every((patternToken, i) => {
                const expectedExpression = expression.slice(
                    lengths[i - 1] || 0,
                    lengths[i]
                );
                if (isTerminal(patternToken))
                    return patternToken === expectedExpression[0];
                return parseType(patternToken.type, expectedExpression);
            })
        ) {
            return debugreturn(true);
        }
    }
    return debugreturn(false);
};

const parseType = (type, expression) => {
    debugstart("parseType", [type, expression]);
    if (!matchToType(type, expression)) return debugreturn(false);
    if (
        expression.length === 1 &&
        !isTerminal(expression[0]) &&
        type === expression[0].type
    )
        return debugreturn(true);
    for (const rule of RULES[type]) {
        if (parseExpression(rule.pattern, expression)) return debugreturn(true);
    }
    return debugreturn(false);
};

const allMatches = (pattern, expression) => {
    debugstart("allMatches", [pattern, expression]);
    if (pattern.length === 0)
        return debugreturn(expression.length === 0 ? [[]] : []);

    if (
        pattern.reduce(
            (p, token) =>
                p + (isTerminal(token) ? 1 : HEURISTICS[token.type].minLength),
            0
        ) > expression.length
    )
        return debugreturn([]);

    if (isTerminal(pattern[0]))
        return debugreturn(
            allMatches(pattern.slice(1), expression.slice(1)).map((match) => [
                1,
                ...match.map((len) => len + 1),
            ])
        );

    const matches = [];
    for (let i = 0; i <= expression.length; i++) {
        if (matchToType(pattern[0].type, expression.slice(0, i)))
            matches.push(
                ...allMatches(pattern.slice(1), expression.slice(i)).map(
                    (match) => [i, ...match.map((len) => len + i)]
                )
            );
    }
    return debugreturn(matches);
};

const matchToType = (type, expression) => {
    debugstart("matchToType", [type, expression]);
    const regex = HEURISTICS[type];

    if (expression.length < regex.minLength) return debugreturn(false);
    if (!regex.startTokens[forceTerminal(expression[0])])
        return debugreturn(false);
    if (!regex.endTokens[forceTerminal(expression[expression.length - 1])])
        return debugreturn(false);
    return debugreturn(
        expression.every((token) => regex.dict[forceTerminal(token)])
    );
};

const forceTerminal = (a) => (isTerminal(a) ? a : "type:" + a.type);

const debugstart = (functionName, args) => {
    if (DEBUG)
        console.log(
            `${Array(spaces).fill(" ").join("")}${functionName}(${args
                .map(toString)
                .join(", ")}) {`
        );
    spaces += 3;
};

const debugreturn = (value) => {
    spaces -= 3;
    if (DEBUG)
        console.log(
            `${Array(spaces).fill(" ").join("")}} -> ${toString(value)}`
        );
    return value;
};

const toString = (obj) => {
    if (typeof obj !== "object") return obj;
    if (obj.length !== undefined)
        return "[" + obj.map(toString).join(",") + "]";
    return (
        "{" +
        Object.keys(obj).map((key) => key + ":" + toString(obj[key])) +
        "}"
    );
};

let spaces = 0;

let DEBUG = true;

// console.log(require('util').inspect(HEURISTICS, false, null, true));
console.log(parseType("N", "n--nn-n--n-nn-n".split("")));
// console.log(matchToType("N", 'n--nn-n--n-nn-n'.split('')));
// console.log(parseType("A", ['0', '0', '1', '1']))
