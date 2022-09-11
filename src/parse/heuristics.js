const { isTerminal } = require("../util/parsingUtils");
const { inspect } = require("../util");

const RULES = require("../expressions");
const { newTokenDict, addToTokenDict, addTokenDicts } = require("./tokenDict");

const HEURISTICS = {
    types: {
        // [type]: {
        //     [typeHeuristic]: value,
        // },
    },
    typeHeuristics: {
        // [typeHeuristic]: (type, expression) => boolean,
    },
};

// This is so it can be accessed later by the start and end dict function
let toAddHeuristics;

const generateHeuristics = () => {
    toAddHeuristics = {};

    toAddHeuristics.minLength = getMinLengths();
    HEURISTICS.typeHeuristics.minLength = (type, expression) =>
        expression.length < HEURISTICS.types[type].minLength && {
            error: `"${expression}" is shorter than the minimum possible length (${HEURISTICS.types[type].minLength}) for type: ${type}!"`,
        };

    toAddHeuristics.maxLength = getMaxLengths();
    HEURISTICS.typeHeuristics.maxLength = (type, expression) =>
        expression.length > HEURISTICS.types[type].maxLength && {
            error: `"${expression}" is longer than the maximum possible length (${HEURISTICS.types[type].maxLength}) for type: ${type}!"`,
        };

    toAddHeuristics.dict = getDicts();
    HEURISTICS.typeHeuristics.dict = (type, expression) => {
        for (const token of expression) {
            if (!HEURISTICS.types[type].dict[token])
                return {
                    error: `'${token}' is not in the set of allowed tokens for type: ${type}!"`,
                };
        }
        return true;
    };
    toAddHeuristics.startDict = getStartDicts();
    HEURISTICS.typeHeuristics.startDict = (type, expression) =>
        !HEURISTICS.types[type].startDict[expression[0]] && {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!"`,
        };
    toAddHeuristics.endDict = getEndDicts();
    HEURISTICS.typeHeuristics.endDict = (type, expression) =>
        !HEURISTICS.types[type].endDict[expression[expression.length - 1]] && {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!"`,
        };

    // Attach each heuristic
    for (const type in RULES) {
        HEURISTICS.types[type] = {};
        for (const heuristic in HEURISTICS.typeHeuristics) {
            HEURISTICS.types[type][heuristic] =
                toAddHeuristics[heuristic][type];
        }
    }
};

/*************************
 * Min Length functions
 *************************/

const getMinLengths = () => {
    const minLengths = {};
    for (const type in RULES) {
        minLengths[type] = getTypeMinLength(type);
    }
    return minLengths;
};

const getTypeMinLength = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListMinLength(
        RULES[type].map(({ pattern }) => pattern),
        parentCalls,
        cache
    );
    return cache[type];
};

const getPatternListMinLength = (patternList, parentCalls, cache) => {
    let min = Number.MAX_SAFE_INTEGER;
    for (const pattern of patternList) {
        min = Math.min(min, getPatternMinLength(pattern, parentCalls, cache));
        if (min === 0) break;
    }
    return min;
};

const getPatternMinLength = (pattern, parentCalls, cache) => {
    let currentLength = 0;
    for (const token of pattern) {
        if (isTerminal(token)) {
            currentLength += token.length;
            continue;
        }
        if (token.metaType) {
            switch (token.metaType) {
                case "or":
                    currentLength += getPatternListMinLength(
                        token.patterns,
                        parentCalls,
                        cache
                    );
                    break;
                case "multi":
                    if (token.min === 0) continue;
                    currentLength +=
                        getPatternMinLength(token.pattern, parentCalls, cache) *
                        token.min;
                    break;
                case "anychar":
                    currentLength += 1;
                    continue;
            }
        } else {
            currentLength += getTypeMinLength(
                token.type,
                { ...parentCalls },
                cache
            );
        }
        if (currentLength >= Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    return currentLength;
};

/*************************
 * Max Length functions
 *************************/

const getMaxLengths = () => {
    const maxLengths = {};
    for (const type in RULES) {
        maxLengths[type] = getTypeMaxLength(type);
    }
    return maxLengths;
};

const getTypeMaxLength = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;

    cache[type] = getPatternListMaxLength(
        RULES[type].map(({ pattern }) => pattern),
        parentCalls,
        cache
    );
    return cache[type];
};

const getPatternListMaxLength = (patternList, parentCalls, cache) => {
    let max = 0;
    for (const pattern of patternList) {
        max = Math.max(max, getPatternMaxLength(pattern, parentCalls, cache));
        if (max >= Number.MAX_SAFE_INTEGER) break;
    }
    return max;
};

const getPatternMaxLength = (pattern, parentCalls, cache) => {
    let currentLength = 0;
    for (const token of pattern) {
        if (isTerminal(token)) {
            currentLength += token.length;
            continue;
        }
        if (token.metaType) {
            switch (token.metaType) {
                case "or":
                    currentLength += getPatternListMaxLength(
                        token.patterns,
                        parentCalls,
                        cache
                    );
                    break;
                case "multi":
                    if (token.max === 0) {
                        console.warn(
                            "You have a multi token with a max length of 0, this should probably never happen."
                        );
                        continue;
                    }
                    currentLength +=
                        getPatternMaxLength(token.pattern, parentCalls, cache) *
                        token.max;
                    break;
                case "anychar":
                    currentLength += 1;
                    continue;
            }
        } else {
            currentLength += getTypeMaxLength(
                token.type,
                { ...parentCalls },
                cache
            );
        }
        if (currentLength >= Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    return currentLength;
};

/*************************
 * Dict functions
 *************************/

const getDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeDict(type);
    }
    return dicts;
};

const getTypeDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;

    cache[type] = getPatternListDict(
        RULES[type].map(({ pattern }) => pattern),
        parentCalls,
        cache
    );
    return cache[type];
};

const getPatternListDict = (patternList, parentCalls, cache) => {
    let dict = newTokenDict();
    for (const pattern of patternList) {
        dict = addTokenDicts(dict, getPatternDict(pattern, parentCalls, cache));
    }
    return dict;
};

const getPatternDict = (pattern, parentCalls, cache) => {
    let dict = newTokenDict();
    for (const token of pattern) {
        if (isTerminal(token)) {
            dict = addToTokenDict(dict, token);
            continue;
        }
        if (token.metaType) {
            switch (token.metaType) {
                case "or":
                    dict = addTokenDicts(
                        dict,
                        getPatternListDict(token.patterns, parentCalls, cache)
                    );
                    break;
                case "multi":
                    dict = addTokenDicts(
                        dict,
                        getPatternDict(token.pattern, parentCalls, cache)
                    );
                    break;
                case "anychar":
                    dict = addTokenDicts(dict, token.tokenDict);
                    break;
            }
        } else {
            dict = addTokenDicts(
                dict,
                getTypeDict(token.type, { ...parentCalls }, cache)
            );
        }
    }
    return dict;
};

/*************************
 * Start Dict functions
 *************************/

const getStartDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeStartDict(type);
    }
    return dicts;
};

const getTypeStartDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListStartDict(
        RULES[type].map(({ pattern }) => pattern),
        parentCalls,
        cache
    );
    return cache[type];
};

const getPatternListStartDict = (patternList, parentCalls, cache) => {
    let startDict = newTokenDict();
    for (const pattern of patternList) {
        startDict = addTokenDicts(
            startDict,
            getPatternStartDict(pattern, parentCalls, cache)
        );
    }
    return startDict;
};

const getPatternStartDict = (pattern, parentCalls, cache) => {
    let startDict = newTokenDict();
    for (const token of pattern) {
        if (isTerminal(token)) {
            if (token.length) {
                return addToTokenDict(startDict, token[0]);
            }
            continue;
        }

        if (token.metaType) {
            switch (token.metaType) {
                case "or":
                    startDict = addTokenDicts(
                        startDict,
                        getPatternListStartDict(
                            token.patterns,
                            parentCalls,
                            cache
                        )
                    );
                    if (getPatternListMinLength(token.patterns, {}, {}))
                        return startDict;
                    break;
                case "multi":
                    startDict = addTokenDicts(
                        startDict,
                        getPatternStartDict(token.pattern, parentCalls, cache)
                    );
                    if (token.min && getPatternMinLength(token.pattern, {}, {}))
                        return startDict;
                    break;
                case "anychar":
                    return addTokenDicts(startDict, token.tokenDict);
            }
        } else {
            startDict = addTokenDicts(
                startDict,
                getTypeStartDict(token.type, { ...parentCalls }, cache)
            );

            if (toAddHeuristics.minLength[token.type]) return startDict;
        }
    }
    return startDict;
};

/*************************
 * End Dict functions
 *************************/

const getEndDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeEndDict(type);
    }
    return dicts;
};

const getTypeEndDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListEndDict(
        RULES[type].map(({ pattern }) => pattern),
        parentCalls,
        cache
    );
    return cache[type];
};

const getPatternListEndDict = (patternList, parentCalls, cache) => {
    let endDict = newTokenDict();
    for (const pattern of patternList) {
        endDict = addTokenDicts(
            endDict,
            getPatternEndDict(pattern, parentCalls, cache)
        );
    }
    return endDict;
};

const getPatternEndDict = (pattern, parentCalls, cache) => {
    let endDict = newTokenDict();
    for (let i = pattern.length - 1; i >= 0; i--) {
        const token = pattern[i];
        if (isTerminal(token)) {
            if (token.length) {
                return addToTokenDict(endDict, token[token.length - 1]);
            }
            continue;
        }
        if (token.metaType) {
            switch (token.metaType) {
                case "or":
                    endDict = addTokenDicts(
                        endDict,
                        getPatternListEndDict(
                            token.patterns,
                            parentCalls,
                            cache
                        )
                    );
                    if (getPatternListMinLength(token.patterns, {}, {}))
                        return endDict;
                    break;
                case "multi":
                    endDict = addTokenDicts(
                        endDict,
                        getPatternEndDict(token.pattern, parentCalls, cache)
                    );
                    if (token.min && getPatternMinLength(token.pattern, {}, {}))
                        return endDict;
                    break;
                case "anychar":
                    return addTokenDicts(endDict, token.tokenDict);
            }
        } else {
            endDict = addTokenDicts(
                endDict,
                getTypeEndDict(token.type, { ...parentCalls }, cache)
            );

            if (toAddHeuristics.minLength[token.type]) return endDict;
        }
    }
    return endDict;
};

/*************************
 * Final stuff
 *************************/

generateHeuristics();
module.exports = HEURISTICS;

console.log(inspect(HEURISTICS));
