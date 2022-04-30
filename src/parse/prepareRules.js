const ANYCHAR = (blacklist = "") => {
    if (typeof blacklist !== "string")
        throw "ANYCHAR(blacklist) must have a string!";
    return { metaType: "anychar", blacklist: makeSet(blacklist.split("")) };
};

const NEGATIVELOOKAHEAD = (...pattern) => {
    return { metaType: "negativeLookahead", pattern };
};

const POSITIVELOOKAHEAD = (...pattern) => {
    return { metaType: "positiveLookahead", pattern };
};

const OR = (...patterns) => {
    if (
        patterns.some(
            (pattern) =>
                typeof pattern !== "object" || pattern.length === undefined
        )
    )
        throw "OR(...patterns) must be given one or more lists!";
    return { metaType: "or", patterns };
};

const MULTI = (pattern, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    if (typeof pattern !== "object" || pattern.length === undefined)
        throw "MULTI(pattern) must be a list!";
    return {
        metaType: "multi",
        pattern,
        min,
        max,
    };
};

const OPTIONAL = (x) => MULTI(x, 0, 1);

/**
 * Spaces:
 * - ignore (default):
 *      Assume there can be an optional space (or many) in between every token. (Not on the outsides)
 * - dont-ignore:
 *      You must specify in the pattern itself if you want spaces to be included in the pattern.
 * - require:
 *      Assume there will always be at least one space between every token. (Not on the outsides)
 */

module.exports = { ANYCHAR, NOT, OR, MULTI, OPTIONAL };
