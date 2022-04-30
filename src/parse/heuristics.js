const { makeSet } = require("../util/sets");

const makeHeuristics = (rules) => {
    const heuristics = {};
    for (const type in rules) {
        heuristics[type] = getHeuristicObject(type, rules, heuristics);
    }
    return heuristics;
};

const getHeuristics = (token, rules, heuristics) => {
    if (isTerminal(token)) {
        return {
            minLength: token.length,
            maxLength: token.length,

            startTokens: { [token[0]]: true },
            endTokens: { [token[token.length - 1]]: true },
            dict: makeSet(token.split("")),
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
    return getHeuristicObject(token.type, rules, heuristics);
};

const combineTokenDicts = (A, B) => {
    if (A.metaType === "anychar") {
        if (B.metaType === "anychar")
            return {
                metaType: "anychar",
                blacklist: intersect(A.blacklist, B.blacklist),
            };
        return { metaType: "anychar", blacklist: intersect(A.blacklist, B) };
    }
    if (B.metaType === "anychar") return combineTokenDicts(B, A);

    return { ...A, ...B };
};
const getPatternHeuristics = (pattern, rules, heuristics) => {
    let doneWithStartTokens = false;

    const patternHeuristics = {
        minLength: 0,
        maxLength: 0,
        dict: {},
        startTokens: {},
        endTokens: {},
    };

    for (const token of pattern) {
        const tokenHeuristics = getHeuristics(token, rules, heuristics);

        patternHeuristics.minLength += tokenHeuristics.minLength;
        patternHeuristics.maxLength += tokenHeuristics.maxLength;

        if (!doneWithStartTokens) {
            if (tokenHeuristics.minLength !== 0) doneWithStartTokens = true;

            patternHeuristics.startTokens = combineTokenDicts(
                patternHeuristics.startTokens,
                tokenHeuristics.startTokens
            );
        }

        if (tokenHeuristics.minLength === 0) {
            patternHeuristics.endTokens = combineTokenDicts(
                patternHeuristics.endTokens,
                tokenHeuristics.endTokens
            );
        } else {
            patternHeuristics.endTokens = tokenHeuristics.endTokens;
        }

        patternHeuristics.dict = combineTokenDicts(
            patternHeuristics.dict,
            tokenHeuristics.dict
        );
    }
    return patternHeuristics;
};

const getHeuristicObject = (type, rules, heuristics) => {
    if (heuristics[type]) return heuristics[type];
    // set to recurse value;
    heuristics[type] = {
        minLength: Number.MAX_SAFE_INTEGER,
        maxLength: Number.MAX_SAFE_INTEGER,
        dict: {},
        startTokens: {},
        endTokens: {},
    };

    const typeHeuristics = {
        minLength: Number.MAX_SAFE_INTEGER,
        maxLength: 0,
        dict: {},
        startTokens: {},
        endTokens: {},
    };

    for (const rule of rules[type]) {
        const patternHeuristics = getPatternHeuristics(
            rule.pattern,
            rules,
            heuristics
        );

        typeHeuristics.minLength = Math.min(
            typeHeuristics.minLength,
            patternHeuristics.minLength
        );
        typeHeuristics.maxLength = Math.max(
            typeHeuristics.maxLength,
            patternHeuristics.maxLength
        );

        typeHeuristics.startTokens = combineTokenDicts(
            typeHeuristics.startTokens,
            patternHeuristics.startTokens
        );
        typeHeuristics.endTokens = combineTokenDicts(
            typeHeuristics.endTokens,
            patternHeuristics.endTokens
        );
        typeHeuristics.dict = combineTokenDicts(
            typeHeuristics.dict,
            patternHeuristics.dict
        );
    }
    return (heuristics[type] = {
        ...typeHeuristics,
        minLength: Math.min(typeHeuristics.minLength, Number.MAX_SAFE_INTEGER),
        maxLength: Math.min(typeHeuristics.maxLength, Number.MAX_SAFE_INTEGER),
    });
};

const isTerminal = (token) =>
    typeof token !== "object" || !token.type || !RULES[token.type];

const RULES = {
    // N: [
    //     {
    //         pattern: [{ type: "N" }, "-", { type: "N" }],
    //     },
    //     {
    //         pattern: [{ type: "N" }, { type: "N" }],
    //     },
    //     {
    //         pattern: ["-", { type: "N" }],
    //     },
    //     {
    //         pattern: ["n"],
    //     },
    // ],
    // String: [
    //     {
    //         pattern: ['"', { type: "Stringinnerts" }, '"'],
    //     },
    //     {
    //         pattern: ["print", { type: "String" }],
    //     },
    // ],
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
