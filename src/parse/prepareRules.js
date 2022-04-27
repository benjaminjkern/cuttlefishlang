const ANY = (...including) => {
    return { type: "any", including };
};

const NOT = (...avoiding) => {
    return { type: "any", avoiding };
};

const MULTI = (x, min = 0, max = Number.MAX_SAFE_INTEGER) => {};

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
