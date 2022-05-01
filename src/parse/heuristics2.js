const { makeSet, union, intersect, subtract, equals } = require("../util/sets");
const { inspect } = require("../util");

const makeHeuristics = (rules) => {
    const heuristics = {};
    heuristics.minLength = makeHeuristic(getMinLength, rules);
    heuristics.maxLength = makeHeuristic(getMaxLength, rules);
    heuristics.dict = makeHeuristic(getDict, rules);
    heuristics.startDict = makeHeuristic(getStartTokens, rules, heuristics);
    heuristics.endDict = makeHeuristic(getEndTokens, rules, heuristics);

    const perTypeHeuristics = {};
    for (const type in rules) {
        perTypeHeuristics[type] = {};
        for (const heuristic in heuristics) {
            perTypeHeuristics[type][heuristic] = heuristics[heuristic][type];
        }
    }
    return perTypeHeuristics;
};

const makeHeuristic = (getFunction, rules, ...args) => {
    const values = {};
    for (const type in rules) {
        values[type] = getFunction(type, rules, values, ...args);
    }
    return values;
};

const getMinLength = (type, rules, values) => {
    if (values[type] !== undefined) return values[type];
    values[type] = Number.MAX_SAFE_INTEGER;

    patterns: for (const { pattern } of rules[type]) {
        let patternMinLength = 0;
        for (const token of pattern) {
            if (isTerminal(token)) {
                patternMinLength += token.length;
                continue;
            }
            if (token.type === type) {
                // Ignore this route, there is no way that it can be shorter than another route if it self-recurses
                continue patterns;
            }
            patternMinLength += getMinLength(token.type, rules, values);
        }
        values[type] = Math.min(values[type], patternMinLength);
    }
    return values[type];
};

const getMaxLength = (type, rules, values) => {
    if (values[type] !== undefined) return values[type];
    values[type] = 0;

    for (const { pattern } of rules[type]) {
        let patternMaxLength = 0;
        for (const token of pattern) {
            if (isTerminal(token)) {
                patternMaxLength += token.length;
                continue;
            }
            if (token.type === type) {
                values[type] = Number.MAX_SAFE_INTEGER;
                return values[type];
            }
            patternMaxLength += getMaxLength(token.type, rules, values);
            if (patternMaxLength >= Number.MAX_SAFE_INTEGER) {
                values[type] = Number.MAX_SAFE_INTEGER;
                return values[type];
            }
        }
        values[type] = Math.max(values[type], patternMaxLength);
    }
    return values[type];
};

const getDict = (type, rules, values) => {
    if (values[type] !== undefined) return values[type];
    values[type] = { whitelist: {} };
    for (const { pattern } of rules[type]) {
        for (const token of pattern) {
            if (isTerminal(token)) {
                values[type] = combineTokenDicts(values[type], {
                    whitelist: makeSet(token.split("")),
                });
                continue;
            }
            if (token.type === type) continue;
            values[type] = combineTokenDicts(
                values[type],
                getDict(token.type, rules, values)
            );
        }
    }
    return values[type];
};

const getStartTokens = (type, rules, values, heuristics) => {
    if (values[type] !== undefined) return values[type];
    values[type] = { whitelist: {} };
    for (const { pattern } of rules[type]) {
        for (const token of pattern) {
            if (isTerminal(token)) {
                values[type] = combineTokenDicts(values[type], {
                    whitelist: makeSet([token[0]]),
                });
                if (token.length) break;
                continue;
            }
            if (token.type !== type)
                values[type] = combineTokenDicts(
                    values[type],
                    getStartTokens(token.type, rules, values, heuristics)
                );

            if (heuristics.minLength[token.type]) break;
        }
    }
    return values[type];
};

const getEndTokens = (type, rules, values, heuristics) => {
    if (values[type] !== undefined) return values[type];
    values[type] = { whitelist: {} };
    for (const { pattern } of rules[type]) {
        const reversedPatterns = [...pattern].reverse();
        for (const token of reversedPatterns) {
            if (isTerminal(token)) {
                values[type] = combineTokenDicts(values[type], {
                    whitelist: makeSet([token[token.length - 1]]),
                });
                if (token.length) break;
                continue;
            }
            if (token.type !== type)
                values[type] = combineTokenDicts(
                    values[type],
                    getEndTokens(token.type, rules, values, heuristics)
                );
            if (heuristics.minLength[token.type]) break;
        }
    }
    return values[type];
};

const combineTokenDicts = (A, B) => {
    if (A.blacklist) {
        if (B.blacklist)
            return { blacklist: intersect(A.blacklist, B.blacklist) };
        return { blacklist: subtract(A.blacklist, B.whitelist) };
    }
    if (B.blacklist) return { blacklist: subtract(B.blacklist, A.whitelist) };
    return { whitelist: union(A.whitelist, B.whitelist) };
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

console.log(inspect(makeHeuristics(RULES)));

module.exports = makeHeuristics;
