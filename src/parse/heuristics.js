const { isTerminal } = require("../util/parsingUtils");

const RULES = require("../expressions");
const {
    newTokenDict,
    addToTokenDict,
    addTokenDicts,
    isValidToken,
} = require("./tokenDict");

const HEURISTICS = {
    types: {
        // [type]: {
        //     [heuristic]: value,
        // },
    },
    typeHeuristics: {
        // [heuristic]: (type, expression) => boolean,
    },
    metaTypeHeuristics: {
        // [heuristic]: (metaType, expression) => boolean,
    },
    patternHeuristics: {
        // [heuristic]: (pattern) => value,
    },
};

// This is so it can be accessed later by the start and end dict function
let toAddHeuristics;

const generateHeuristics = () => {
    if (toAddHeuristics) {
        console.log("Tried generating Heuristics twice!");
        return;
    }
    toAddHeuristics = {};

    toAddHeuristics.minLength = getMinLengths();
    HEURISTICS.typeHeuristics.minLength = (type, expression) =>
        expression.length < HEURISTICS.types[type].minLength && {
            error: `"${expression}" is shorter than the minimum possible length (${HEURISTICS.types[type].minLength}) for type: ${type}!"`,
        };
    HEURISTICS.metaTypeHeuristics.minLength = (metaTypeToken, expression) => {
        let minLength;
        switch (metaTypeToken.metaType) {
            case "or":
                minLength = getPatternListMinLength(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.minLength
                );
                break;
            case "multi":
                minLength =
                    metaTypeToken.min *
                    getPatternMinLength(
                        metaTypeToken.pattern,
                        {},
                        toAddHeuristics.minLength
                    );
                break;
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        if (expression.length < minLength)
            return {
                error: `"${expression}" is shorter than the minimum possible length (${minLength}) for meta-type: ${metaTypeToken}!"`,
            };
        return true;
    };
    HEURISTICS.patternHeuristics.minLength = (pattern) =>
        getPatternMinLength(pattern, {}, toAddHeuristics.minLength);

    toAddHeuristics.maxLength = getMaxLengths();
    HEURISTICS.typeHeuristics.maxLength = (type, expression) =>
        expression.length > HEURISTICS.types[type].maxLength && {
            error: `"${expression}" is longer than the maximum possible length (${HEURISTICS.types[type].maxLength}) for type: ${type}!"`,
        };
    HEURISTICS.metaTypeHeuristics.maxLength = (metaTypeToken, expression) => {
        let maxLength;
        switch (metaTypeToken.metaType) {
            case "or":
                minLength = getPatternListMaxLength(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.maxLength
                );
                break;
            case "multi":
                minLength =
                    metaTypeToken.max *
                    getPatternMinLength(
                        metaTypeToken.pattern,
                        {},
                        toAddHeuristics.maxLength
                    );
                break;
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        if (expression.length > maxLength)
            return {
                error: `"${expression}" is longer than the maximum possible length (${minLength}) for meta-type: ${metaTypeToken}!"`,
            };
        return true;
    };

    toAddHeuristics.dict = getDicts();
    HEURISTICS.typeHeuristics.dict = (type, expression) => {
        for (const token of expression) {
            if (!isValidToken(HEURISTICS.types[type].dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for type: ${type}!"`,
                };
        }
        return true;
    };
    HEURISTICS.metaTypeHeuristics.dict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let dict;
        switch (metaTypeToken.metaType) {
            case "or":
                dict = getPatternListDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.dict
                );
                break;
            case "multi":
                dict = getPatternDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.dict
                );
                break;
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        for (const token of expression) {
            if (!isValidToken(dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for meta-type: ${metaTypeToken}!"`,
                };
        }
        return true;
    };

    toAddHeuristics.startDict = getStartDicts();
    HEURISTICS.typeHeuristics.startDict = (type, expression) =>
        !isValidToken(HEURISTICS.types[type].startDict, expression[0]) && {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!"`,
        };
    HEURISTICS.metaTypeHeuristics.startDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let startDict;
        switch (metaTypeToken.metaType) {
            case "or":
                startDict = getPatternListStartDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.startDict
                );
                break;
            case "multi":
                startDict = getPatternStartDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.startDict
                );
                break;
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(startDict, expression[0]) && {
                error: `'${expression[0]}' is not in the set of start tokens for meta-type: ${metaTypeToken}!"`,
            }
        );
    };

    toAddHeuristics.endDict = getEndDicts();
    HEURISTICS.typeHeuristics.endDict = (type, expression) =>
        !isValidToken(
            HEURISTICS.types[type].endDict,
            expression[expression.length - 1]
        ) && {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!"`,
        };
    HEURISTICS.metaTypeHeuristics.endDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let endDict;
        switch (metaTypeToken.metaType) {
            case "or":
                endDict = getPatternListEndDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.endDict
                );
                break;
            case "multi":
                endDict = getPatternEndDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.endDict
                );
                break;
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(endDict, expression[expression.length - 1]) && {
                error: `'${
                    expression[expression.length - 1]
                }' is not in the set of end tokens for meta-type: ${metaTypeToken}!"`,
            }
        );
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
        if (minLengths[type] >= Number.MAX_SAFE_INTEGER)
            console.warn(
                `Warning: Type "${type}" has a minimum length of ${minLengths[type]} (Probably an unclosed rule loop)`
            );
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

// console.log(inspect(HEURISTICS));
