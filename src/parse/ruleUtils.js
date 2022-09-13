const { makeSet } = require("../util/sets");

const ANYCHAR = (whitelist = "") => {
    if (typeof whitelist !== "string" || !whitelist.length)
        throw "ANYCHAR(whitelist): whitelist must be a string of characters to include!";
    return {
        metaType: "anychar",
        tokenDict: { whitelist: makeSet(whitelist.split("")) },
    };
};

const NOTCHAR = (blacklist = "") => {
    if (typeof blacklist !== "string")
        throw "NOTCHAR(blacklist): blacklist must be a string of characters to exclude!";
    return {
        metaType: "anychar",
        tokenDict: { blacklist: makeSet(blacklist.split("")) },
    };
};

// const NEGATIVELOOKAHEAD = (...pattern) => {
//     return { metaType: "negativeLookahead", pattern };
// };

// const POSITIVELOOKAHEAD = (...pattern) => {
//     return { metaType: "positiveLookahead", pattern };
// };

const OR = (...patterns) => {
    return {
        metaType: "or",
        patterns: patterns.map((pattern) =>
            isList(pattern) ? pattern : [pattern]
        ),
    };
};

const MULTI = (pattern, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    return {
        metaType: "multi",
        pattern: isList(pattern) ? pattern : [pattern],
        min,
        max,
    };
};

const OPTIONAL = (...x) => MULTI(x, 0, 1);

const isList = (object) =>
    typeof object === "object" && object.length !== undefined;

const type = (typeName) => ({ type: typeName });

module.exports = { ANYCHAR, NOTCHAR, OR, MULTI, OPTIONAL, type };
