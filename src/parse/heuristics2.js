const { makeSet, union, intersect, subtract, equals } = require("../util/sets");
const { inspect } = require("../util");

const makeHeuristics = (rules) => {
    const heuristics = {};
    heuristics.minLength = getMinLengths(rules);
    // heuristics.maxLength = makeHeuristic(getMaxLength, rules);
    // heuristics.dict = makeHeuristic(getDict, rules);
    // heuristics.startDict = makeHeuristic(getStartTokens, rules, heuristics);
    // heuristics.endDict = makeHeuristic(getEndTokens, rules, heuristics);

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

/*************************
 * Min Length functions
 */

const objectMap = (object, func) => {
    return Object.keys(object).reduce(
        (p, key) => ({ ...p, [key]: func(object[key], key) }),
        {}
    );
};

const addValueToOptions = (A, options) => {
    if (typeof A === "number")
        return options.map(({ value, nonterminals }) => ({
            value: value + A,
            nonterminals,
        }));
    const { value: toAddValue, nonterminals: toAddNonterminals } = A;
    return options.map(({ value, nonterminals }) => ({
        value: value + toAddValue,
        nonterminals: objectMap(
            nonterminals,
            (count, key) => count + toAddNonterminals[key]
        ),
    }));
};

const multiplyOptions = (A, options) => {
    return options.map(({ value, nonterminals }) => ({
        value: value * A,
        nonterminals: objectMap(nonterminals, (x) => x * A),
    }));
};

const replaceValues = (options, typeToReplace, replaceValue) => {
    return options.flatMap((option) => {
        const { value, nonterminals } = option;
        if (!nonterminals[typeToReplace]) return option;
        const { [typeToReplace]: count, ...rest } = nonterminals;
        if (typeof replaceValue === "number")
            return { value: value + count * replaceValue, nonterminals: rest };
        return addValueToOptions(
            { value, nonterminals: rest },
            multiplyOptions(count, replaceValue)
        );
    });
};

const getMinLengths = (rules) => {
    const minLengths = {};
    for (const type in rules) {
        const options = getRuleListMinLength(
            rules[type].map(({ pattern }) => pattern)
        );
    }
};

const getRuleListMinLength = (patterns) => {
    let options = [];
    for (const pattern of patterns) {
        const patternMinLength = getPatternMinLength(pattern);
        if (typeof patternMinLength === "number")
            minLength = Math.min(
                minLength,
                getPatternMinLength(pattern, rules, values)
            );
    }
    return minLength;
};

const getPatternMinLength = (pattern, rules, values) => {
    let patternMinLength = 0;
    for (const token of pattern) {
        patternMinLength += getTokenMinLength(token, rules, values);
        if (patternMinLength >= Number.MAX_SAFE_INTEGER)
            return Number.MAX_SAFE_INTEGER;
    }
    return patternMinLength;
};

const getTokenMinLength = (token, rules, values) => {
    if (isTerminal(token)) return token.length;
    switch (token.metaType) {
        case "anychar":
            return 1;
        case "negativelookahead":
        case "positivelookahead":
            return 0;
        case "or":
            return getRuleListMinLength(token.patterns, rules, values);
        case "multi":
            return (
                getPatternMinLength(token.pattern, rules, values) * token.min
            );
    }
    return getMinLength(token.type, rules, values);
};

/*********
 * Max length
 */

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
    B: [
        // { pattern: [] },
        { pattern: ["123", { type: "A" }, { type: "A" }] },
        { pattern: ["123", { type: "A" }, { type: "B" }] },
        { pattern: ["8000"] },
    ],
    A: [
        { pattern: ["0", { type: "A" }, "1"] },
        { pattern: ["123", { type: "B" }, { type: "B" }] },
    ],
};

console.log(inspect(makeHeuristics(RULES)));

module.exports = makeHeuristics;
