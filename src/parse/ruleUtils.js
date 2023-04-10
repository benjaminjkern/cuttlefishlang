import { makeSet } from "../util/sets.js";

export const ANYCHAR = (whitelist = "") => {
    if (typeof whitelist !== "string" || !whitelist.length)
        throw "ANYCHAR(whitelist): whitelist must be a string of characters to include!";
    return {
        metaType: "anychar",
        tokenDict: { whitelist: makeSet(whitelist.split("")) },
    };
};

export const NOTCHAR = (blacklist = "") => {
    if (typeof blacklist !== "string")
        throw "NOTCHAR(blacklist): blacklist must be a string of characters to exclude!";
    return {
        metaType: "anychar",
        tokenDict: { blacklist: makeSet(blacklist.split("")) },
    };
};

// const LISTOF = (token, separator, canBeEmpty = true) => {
//     const listOf = [MULTI([token, separator], 1), OPTIONAL(separator)];
//     return canBeEmpty ? [OPTIONAL(listOf)] : listOf;
// };

// const NEGATIVELOOKAHEAD = (...pattern) => {
//     return { metaType: "negativeLookahead", pattern };
// };

// const POSITIVELOOKAHEAD = (...pattern) => {
//     return { metaType: "positiveLookahead", pattern };
// };

export const OR = (...patterns) => {
    return {
        metaType: "or",
        patterns: patterns.map((pattern) =>
            isList(pattern) ? pattern : [pattern]
        ),
    };
};

export const MULTI = (pattern, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    return {
        metaType: "multi",
        pattern: isList(pattern) ? pattern : [pattern],
        min,
        max,
    };
};

export const OPTIONAL = (...x) => MULTI(x, 0, 1);

const isList = (object) =>
    typeof object === "object" && object.length !== undefined;

export const type = (typeName) => ({ type: typeName });
