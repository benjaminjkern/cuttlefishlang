const {
    makeSet,
    union,
    intersect,
    subtract,
    equals,
} = require("../src/util/sets");
const { inspect } = require("../src/util");

const makeHeuristics = (rules) => {
    const savedHeuristics = {};
    let heuristics = {};
    for (const type in rules) {
        savedHeuristics[type] = getHeuristicObject(type, rules, heuristics);
    }
    heuristics = savedHeuristics;

    // let madeChange = true;
    // while (madeChange) {
    //     madeChange = pass(heuristics);
    // }
    // for (type in heuristics) {
    //     delete heuristics[type].uncountedPatterns;
    //     delete heuristics[type].startTokens.nonterminals;
    //     delete heuristics[type].endTokens.nonterminals;
    //     delete heuristics[type].dict.nonterminals;
    // }
    return heuristics;
};

const getHeuristics = (token, rules, heuristics) => {
    if (isTerminal(token)) {
        let dicts;
        if (token.length) {
            dicts = {
                startTokens: {
                    whitelist: { [token[0]]: true },
                    nonterminals: {},
                },
                endTokens: {
                    whitelist: { [token[token.length - 1]]: true },
                    nonterminals: {},
                },
                dict: { whitelist: makeSet(token.split("")), nonterminals: {} },
            };
        } else {
            dicts = {
                startTokens: { whitelist: {}, nonterminals: {} },
                endTokens: { whitelist: {}, nonterminals: {} },
                dict: { whitelist: {}, nonterminals: {} },
            };
        }
        return {
            minLength: token.length,
            maxLength: token.length,
            uncountedNonterminals: {},
            ...dicts,
        };
    }
    // if (isSpecialToken(token)) {
    //     switch (token.metaType) {
    //         case "anychar":
    //             return {
    //                 minLength: 1,
    //                 maxLength: 1,

    //                 startTokens: token,
    //                 startTokens: token,
    //                 dict: token,
    //             };
    //         case "multi":
    //             const patternHeuristics = getPatternHeuristics(
    //                 token.pattern,
    //                 rules,
    //                 pattern
    //             );
    //             const { minLength, maxLength } = patternHeuristics;
    //             return {
    //                 ...patternHeuristics,
    //                 minLength: minLength * token.min,
    //                 maxLength: maxLength * token.max,
    //             };
    //     }
    // }

    // if (token.type === type) {
    //     // Its not actually the ruleMinLength, but it needs to know that this rule will not be the minimum so it should ignore it
    //     ruleMaxLength = ruleMinLength = Number.MAX_SAFE_INTEGER;
    //     continue;
    // }
    return {
        minLength: 0,
        maxLength: 0,
        uncountedNonterminals: { [token.type]: true },
        dict: { whitelist: {}, nonterminals: { [token.type]: true } },
        startTokens: { whitelist: {}, nonterminals: { [token.type]: true } },
        endTokens: { whitelist: {}, nonterminals: { [token.type]: true } },
    };
};

const combineTokenDicts = (A, B) => {
    let madeChange = false;

    const newNonTerminals = union(A.nonterminals, B.nonterminals);
    madeChange ||= !equals(newNonTerminals, A.nonterminals);
    A.nonterminals = newNonTerminals;

    if (A.blacklist) {
        if (B.blacklist) {
            const newBlacklist = intersect(A.blacklist, B.blacklist);
            madeChange ||= !equals(newBlacklist, A.blacklist);
            A.blacklist = newBlacklist;
            return madeChange;
        }
        const newBlacklist = subtract(A.blacklist, B.whitelist);
        madeChange ||= !equals(newBlacklist, A.blacklist);
        A.blacklist = newBlacklist;
        return madeChange;
    }
    if (B.blacklist) {
        A.blacklist = subtract(B.blacklist, A.whitelist);
        delete A.whitelist;
        return true;
    }

    const newWhitelist = union(A.whitelist, B.whitelist);
    madeChange ||= !equals(newWhitelist, A.whitelist);
    A.whitelist = newWhitelist;

    return madeChange;
};

const getPatternHeuristics = (pattern, rules, heuristics) => {
    let doneWithStartTokens = false;

    const patternHeuristics = {
        minLength: 0,
        maxLength: 0,
        uncountedNonterminals: {},

        dict: { whitelist: {}, nonterminals: {} },
        startTokens: { whitelist: {}, nonterminals: {} },
        endTokens: { whitelist: {}, nonterminals: {} },
    };

    for (const token of pattern) {
        const tokenHeuristics = getHeuristics(token, rules, heuristics);

        patternHeuristics.minLength += tokenHeuristics.minLength;
        patternHeuristics.maxLength += tokenHeuristics.maxLength;
        patternHeuristics.uncountedNonterminals = {
            ...patternHeuristics.uncountedNonterminals,
            ...tokenHeuristics.uncountedNonterminals,
        };

        if (!doneWithStartTokens) {
            if (tokenHeuristics.minLength !== 0) doneWithStartTokens = true;

            combineTokenDicts(
                patternHeuristics.startTokens,
                tokenHeuristics.startTokens
            );
        }

        if (tokenHeuristics.minLength === 0) {
            combineTokenDicts(
                patternHeuristics.endTokens,
                tokenHeuristics.endTokens
            );
        } else {
            patternHeuristics.endTokens = tokenHeuristics.endTokens;
        }

        combineTokenDicts(patternHeuristics.dict, tokenHeuristics.dict);
    }
    return patternHeuristics;
};

const getHeuristicObject = (type, rules, heuristics) => {
    if (heuristics[type]) return heuristics[type];
    const typeHeuristics = {
        minLength: Number.MAX_SAFE_INTEGER,
        maxLength: 0,
        uncountedPatterns: [],

        startTokens: { whitelist: {}, nonterminals: {} },
        endTokens: { whitelist: {}, nonterminals: {} },
        dict: { whitelist: {}, nonterminals: {} },
    };

    for (const rule of rules[type]) {
        const patternHeuristics = getPatternHeuristics(
            rule.pattern,
            rules,
            heuristics
        );

        if (Object.keys(patternHeuristics.uncountedNonterminals).length) {
            const { minLength, maxLength, uncountedNonterminals } =
                patternHeuristics;
            typeHeuristics.uncountedPatterns.push({
                minLength,
                maxLength,
                uncountedNonterminals,
            });
        } else {
            typeHeuristics.minLength = Math.min(
                typeHeuristics.minLength,
                patternHeuristics.minLength
            );
            typeHeuristics.maxLength = Math.max(
                typeHeuristics.maxLength,
                patternHeuristics.maxLength
            );
        }

        combineTokenDicts(
            typeHeuristics.startTokens,
            patternHeuristics.startTokens
        );
        combineTokenDicts(
            typeHeuristics.endTokens,
            patternHeuristics.endTokens
        );
        combineTokenDicts(typeHeuristics.dict, patternHeuristics.dict);
    }
    return typeHeuristics;
};

const pass = (heuristics) => {
    let madeChange = false;
    for (const type in heuristics) {
        const typeHeuristics = heuristics[type];

        const newPatterns = [];
        while (typeHeuristics.uncountedPatterns.length) {
            const uncountedPattern = typeHeuristics.uncountedPatterns.pop();
            const { minLength, maxLength, uncountedNonterminals } =
                uncountedPattern;
            if (Object.keys(uncountedNonterminals).includes(type)) {
                typeHeuristics.maxLength = Number.MAX_SAFE_INTEGER;
                madeChange = true;
                continue;
            }
            const newMinLength =
                minLength +
                Object.keys(uncountedNonterminals).reduce(
                    (p, c) => p + heuristics[c].minLength,
                    0
                );
            const newMaxLength =
                maxLength +
                Object.keys(uncountedNonterminals).reduce(
                    (p, c) => p + heuristics[c].maxLength,
                    0
                );
            if (newMinLength < typeHeuristics.minLength) {
                typeHeuristics.minLength = newMinLength;
                madeChange = true;
            }
            if (
                typeHeuristics.maxLength < Number.MAX_SAFE_INTEGER &&
                newMaxLength > typeHeuristics.maxLength
            ) {
                typeHeuristics.maxLength = newMaxLength;
                madeChange = true;
            }
            newPatterns.push(uncountedPattern);
        }

        madeChange ||= tokenDictPass(
            type,
            typeHeuristics,
            "startTokens",
            heuristics
        );
        madeChange ||= tokenDictPass(
            type,
            typeHeuristics,
            "endTokens",
            heuristics
        );
        madeChange ||= tokenDictPass(type, typeHeuristics, "dict", heuristics);
    }
    return madeChange;
};

const tokenDictPass = (originalType, heuristicObject, dictName, heuristics) => {
    let madeChange = false;
    let dict = heuristicObject[dictName];
    for (const type in dict.nonterminals) {
        if (type === originalType) continue;
        madeChange ||= combineTokenDicts(dict, heuristics[type][dictName]);
    }
    return madeChange;
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
