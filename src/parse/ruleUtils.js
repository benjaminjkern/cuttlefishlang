import { makeSet } from "../util/sets.js";

export const ANYCHAR = (whitelist = "", caseInsensitive = false) => {
    if (typeof whitelist !== "string" || !whitelist.length)
        throw "ANYCHAR(whitelist): whitelist must be a string of characters to include!";
    return {
        metaType: "anychar",
        tokenDict: {
            whitelist: makeSet(
                caseInsensitive
                    ? whitelist
                          .split("")
                          .flatMap((char) => [
                              char.toLowerCase(),
                              char.toUpperCase(),
                          ])
                    : whitelist.split("")
            ),
        },
    };
};

export const NOTCHAR = (blacklist = "", caseInsensitive = false) => {
    if (typeof blacklist !== "string")
        throw "NOTCHAR(blacklist): blacklist must be a string of characters to exclude!";
    return {
        metaType: "anychar",
        tokenDict: {
            blacklist: makeSet(
                caseInsensitive
                    ? blacklist
                          .split("")
                          .flatMap((char) => [
                              char.toLowerCase(),
                              char.toUpperCase(),
                          ])
                    : blacklist.split("")
            ),
        },
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

export const combineRulesets = (baseRules, newRules) => {
    // NOTE: Right now in the only place I'm using this, the baserules are already a clone so doing this extra cloning is redundant
    // Make a semi-shallow copy (The rules themselves can be the same object but the ruleset and the rulelists need to be new)
    const returnRules = Object.keys(baseRules).reduce(
        (p, key) => ({
            ...p,
            [key]: [...baseRules[key]],
        }),
        {}
    );
    for (const key in newRules) {
        if (!(key in returnRules)) returnRules[key] = newRules[key];
        else returnRules[key].push(...newRules[key]);
    }
    return returnRules;
};

export const type = (typeName, ...subtypes) => ({ type: typeName, subtypes });

export const thisType = () => ({ thisType: true });

export const genericType = (typeName) => ({ genericType: typeName });

let subcontextId = 0;
export const subcontext = (pattern, createNewContext) => {
    const token = {
        metaType: "subcontext",
        pattern,
        subcontextId: ++subcontextId,
        getSubcontext: () => {
            if (token.subcontext) return token.subcontext;
            const newContext = createNewContext(token.subcontextId);
            token.subcontext = newContext;
            return token.subcontext;
        },
    };
    return token;
};
