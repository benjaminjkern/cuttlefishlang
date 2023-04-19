import { consoleWarn } from "../util/environment.js";
import { debugFunction } from "../util/index.js";
import { getAllRules } from "./genericUtils.js";
import { isTerminal, stringifyPattern } from "./parsingUtils.js";

import {
    newTokenDict,
    addToTokenDict,
    addTokenDicts,
    isValidToken,
} from "./tokenDict.js";

const generateHeuristics = (rules, generics, parentContexts) => {
    // This is so it can be accessed later by the start and end dict function
    const toAddHeuristics = {};

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

    const context = { rules, generics, parentContexts }; // Its easier to toss this around than separately use the rules and generics

    toAddHeuristics.minLength = getMinLengths(context);
    HEURISTICS.typeHeuristics.minLength = (type, expression) =>
        expression.length < HEURISTICS.types[type].minLength && {
            error: `"${expression}" is shorter than the minimum possible length (${HEURISTICS.types[type].minLength}) for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.minLength = (metaTypeToken, expression) => {
        let minLength;
        switch (metaTypeToken.metaType) {
            case "or":
                minLength = getPatternListMinLength(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.minLength,
                    context
                );
                break;
            case "multi":
                minLength =
                    metaTypeToken.min *
                    getPatternMinLength(
                        metaTypeToken.pattern,
                        {},
                        toAddHeuristics.minLength,
                        context
                    );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        if (expression.length < minLength)
            return {
                error: `"${expression}" is shorter than the minimum possible length (${minLength}) for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!"`,
            };
        return true;
    };
    HEURISTICS.patternHeuristics.minLength = (pattern) =>
        getPatternMinLength(pattern, {}, toAddHeuristics.minLength, context);

    toAddHeuristics.maxLength = getMaxLengths(context);
    HEURISTICS.typeHeuristics.maxLength = (type, expression) =>
        expression.length > HEURISTICS.types[type].maxLength && {
            error: `"${expression}" is longer than the maximum possible length (${HEURISTICS.types[type].maxLength}) for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.maxLength = (metaTypeToken, expression) => {
        let maxLength;
        switch (metaTypeToken.metaType) {
            case "or":
                maxLength = getPatternListMaxLength(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.maxLength,
                    context
                );
                break;
            case "multi":
                maxLength =
                    metaTypeToken.max *
                    getPatternMaxLength(
                        metaTypeToken.pattern,
                        {},
                        toAddHeuristics.maxLength,
                        context
                    );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        if (expression.length > maxLength)
            return {
                error: `"${expression}" is longer than the maximum possible length (${maxLength}) for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!`,
            };
        return true;
    };
    HEURISTICS.patternHeuristics.maxLength = (pattern) =>
        getPatternMaxLength(pattern, {}, toAddHeuristics.maxLength, context);

    toAddHeuristics.dict = getDicts(context);
    HEURISTICS.typeHeuristics.dict = (type, expression) => {
        for (const token of expression) {
            if (!isValidToken(HEURISTICS.types[type].dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for type: ${type}!`,
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
                    toAddHeuristics.dict,
                    context
                );
                break;
            case "multi":
                dict = getPatternDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.dict,
                    context
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        for (const token of expression) {
            if (!isValidToken(dict, token))
                return {
                    error: `'${token}' is not in the set of allowed tokens for meta-type: ${stringifyPattern(
                        [metaTypeToken]
                    )}!`,
                };
        }
        return true;
    };

    toAddHeuristics.startDict = getStartDicts(context, toAddHeuristics);
    HEURISTICS.typeHeuristics.startDict = (type, expression) =>
        !isValidToken(HEURISTICS.types[type].startDict, expression[0]) && {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.startDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let startDict;
        switch (metaTypeToken.metaType) {
            case "or":
                startDict = getPatternListStartDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.startDict,
                    context,
                    toAddHeuristics
                );
                break;
            case "multi":
                startDict = getPatternStartDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.startDict,
                    context,
                    toAddHeuristics
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(startDict, expression[0]) && {
                error: `'${
                    expression[0]
                }' is not in the set of start tokens for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!`,
            }
        );
    };

    toAddHeuristics.endDict = getEndDicts(context, toAddHeuristics);
    HEURISTICS.typeHeuristics.endDict = (type, expression) =>
        !isValidToken(
            HEURISTICS.types[type].endDict,
            expression[expression.length - 1]
        ) && {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!`,
        };
    HEURISTICS.metaTypeHeuristics.endDict = (metaTypeToken, expression) => {
        if (!expression.length) return true;
        let endDict;
        switch (metaTypeToken.metaType) {
            case "or":
                endDict = getPatternListEndDict(
                    metaTypeToken.patterns,
                    {},
                    toAddHeuristics.endDict,
                    context,
                    toAddHeuristics
                );
                break;
            case "multi":
                endDict = getPatternEndDict(
                    metaTypeToken.pattern,
                    {},
                    toAddHeuristics.endDict,
                    context,
                    toAddHeuristics
                );
                break;
            // NOTE: anychar & subcontext are both handled in the checkMetaTypeHeuristics() function
            default:
                return {
                    error: `Invalid meta-type: ${metaTypeToken.metaType}`,
                };
        }
        return (
            !isValidToken(endDict, expression[expression.length - 1]) && {
                error: `'${
                    expression[expression.length - 1]
                }' is not in the set of end tokens for meta-type: ${stringifyPattern(
                    [metaTypeToken]
                )}!"`,
            }
        );
    };

    // Attach each heuristic
    for (const type in rules) {
        HEURISTICS.types[type] = {};
        for (const heuristic in HEURISTICS.typeHeuristics) {
            HEURISTICS.types[type][heuristic] =
                toAddHeuristics[heuristic][type];
        }
    }
    return HEURISTICS;
};

/*************************
 * Min Length functions
 *************************/

const getMinLengths = (context) => {
    const minLengths = {};
    for (const type in context.rules) {
        minLengths[type] = getTypeMinLength(
            type,
            undefined,
            undefined,
            context
        );

        if (minLengths[type] >= Number.MAX_SAFE_INTEGER)
            consoleWarn(
                `Warning: Type "${type}" has a minimum length of ${minLengths[type]} (Probably an unclosed rule loop)`
            );
    }
    return minLengths;
};

const getTypeMinLength = (type, parentCalls = {}, cache = {}, context) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListMinLength(
        getAllRules(type, context).map(({ pattern }) => pattern),
        parentCalls,
        cache,
        context
    );
    return cache[type];
};

const getPatternListMinLength = (patternList, parentCalls, cache, context) => {
    let min = Number.MAX_SAFE_INTEGER;
    for (const pattern of patternList) {
        min = Math.min(
            min,
            getPatternMinLength(pattern, parentCalls, cache, context)
        );
        if (min === 0) break;
    }
    return min;
};

const getPatternMinLength = (pattern, parentCalls, cache, context) => {
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
                        cache,
                        context
                    );
                    break;
                case "multi":
                    if (token.min === 0) continue;
                    currentLength +=
                        getPatternMinLength(
                            token.pattern,
                            parentCalls,
                            cache,
                            context
                        ) * token.min;
                    break;
                case "anychar":
                    currentLength += 1;
                    continue;
                case "subcontext":
                    currentLength += getSubcontextMinLength(
                        token,
                        parentCalls,
                        cache,
                        context
                    );
                    break;
            }
        } else {
            currentLength += getTypeMinLength(
                token.type,
                { ...parentCalls },
                cache,
                context
            );
        }
        if (currentLength >= Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    return currentLength;
};
const getSubcontextMinLength = (
    subcontextToken,
    parentCalls,
    cache,
    context
) => {
    if (context.parentContexts[subcontextToken.subcontextId])
        return getPatternMinLength(
            subcontextToken.pattern,
            parentCalls,
            cache,
            context
        );

    return subcontextToken
        .getSubcontext()
        .heuristics.patternHeuristics.minLength(subcontextToken.pattern);
};

/*************************
 * Max Length functions
 *************************/

const getMaxLengths = (context) => {
    const maxLengths = {};
    for (const type in context.rules) {
        maxLengths[type] = getTypeMaxLength(
            type,
            undefined,
            undefined,
            context
        );
    }
    return maxLengths;
};

const getTypeMaxLength = (type, parentCalls = {}, cache = {}, context) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListMaxLength(
        getAllRules(type, context).map(({ pattern }) => pattern),
        parentCalls,
        cache,
        context
    );
    return cache[type];
};

const getPatternListMaxLength = (patternList, parentCalls, cache, context) => {
    let max = 0;
    for (const pattern of patternList) {
        max = Math.max(
            max,
            getPatternMaxLength(pattern, parentCalls, cache, context)
        );
        if (max >= Number.MAX_SAFE_INTEGER) break;
    }
    return max;
};

const getPatternMaxLength = (pattern, parentCalls, cache, context) => {
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
                        cache,
                        context
                    );
                    break;
                case "multi":
                    if (token.max === 0) {
                        consoleWarn(
                            "You have a multi token with a max length of 0, this should probably never happen."
                        );
                        continue;
                    }
                    currentLength +=
                        getPatternMaxLength(
                            token.pattern,
                            parentCalls,
                            cache,
                            context
                        ) * token.max;
                    break;
                case "anychar":
                    currentLength += 1;
                    continue;
                case "subcontext":
                    currentLength += getSubcontextMaxLength(
                        token,
                        parentCalls,
                        cache,
                        context
                    );
                    break;
            }
        } else {
            currentLength += getTypeMaxLength(
                token.type,
                { ...parentCalls },
                cache,
                context
            );
        }
        if (currentLength >= Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    return currentLength;
};

const getSubcontextMaxLength = (
    subcontextToken,
    parentCalls,
    cache,
    context
) => {
    if (context.parentContexts[subcontextToken.subcontextId])
        return getPatternMaxLength(
            subcontextToken.pattern,
            parentCalls,
            cache,
            context
        );

    return subcontextToken
        .getSubcontext()
        .heuristics.patternHeuristics.maxLength(subcontextToken.pattern);
};

/*************************
 * Dict functions
 *************************/

const getDicts = (context) => {
    const dicts = {};
    for (const type in context.rules) {
        dicts[type] = getTypeDict(type, undefined, undefined, context);
    }
    return dicts;
};

const getTypeDict = (type, parentCalls = {}, cache = {}, context) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;

    cache[type] = getPatternListDict(
        getAllRules(type, context).map(({ pattern }) => pattern),
        parentCalls,
        cache,
        context
    );
    return cache[type];
};

const getPatternListDict = (patternList, parentCalls, cache, context) => {
    let dict = newTokenDict();
    for (const pattern of patternList) {
        dict = addTokenDicts(
            dict,
            getPatternDict(pattern, parentCalls, cache, context)
        );
    }
    return dict;
};

const getPatternDict = (pattern, parentCalls, cache, context) => {
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
                        getPatternListDict(
                            token.patterns,
                            parentCalls,
                            cache,
                            context
                        )
                    );
                    break;
                case "multi":
                    dict = addTokenDicts(
                        dict,
                        getPatternDict(
                            token.pattern,
                            parentCalls,
                            cache,
                            context
                        )
                    );
                    break;
                case "anychar":
                    dict = addTokenDicts(dict, token.tokenDict);
                    break;
                case "subcontext":
                    dict = addTokenDicts(
                        dict,
                        getSubcontextDict(token, parentCalls, cache, context)
                    );
                    break;
            }
        } else {
            dict = addTokenDicts(
                dict,
                getTypeDict(token.type, { ...parentCalls }, cache, context)
            );
        }
    }
    return dict;
};
const getSubcontextDict = (subcontextToken, parentCalls, cache, context) => {
    if (context.parentContexts[subcontextToken.subcontextId])
        return getPatternDict(
            subcontextToken.pattern,
            parentCalls,
            cache,
            context
        );

    return getPatternDict(
        subcontextToken.pattern,
        {},
        {},
        subcontextToken.getSubcontext()
    );
};

/*************************
 * Start Dict functions
 *************************/

const getStartDicts = (context, toAddHeuristics) => {
    const dicts = {};
    for (const type in context.rules) {
        dicts[type] = getTypeStartDict(
            type,
            undefined,
            undefined,
            context,
            toAddHeuristics
        );
    }
    return dicts;
};

const getTypeStartDict = (
    type,
    parentCalls = {},
    cache = {},
    context,
    toAddHeuristics
) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListStartDict(
        getAllRules(type, context).map(({ pattern }) => pattern),
        parentCalls,
        cache,
        context,
        toAddHeuristics
    );
    return cache[type];
};

const getPatternListStartDict = (
    patternList,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    let startDict = newTokenDict();
    for (const pattern of patternList) {
        startDict = addTokenDicts(
            startDict,
            getPatternStartDict(
                pattern,
                parentCalls,
                cache,
                context,
                toAddHeuristics
            )
        );
    }
    return startDict;
};

const getPatternStartDict = (
    pattern,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    let startDict = newTokenDict();
    for (const token of pattern) {
        if (isTerminal(token)) {
            // if the minimum length is > 0, no need to check any further
            if (token.length) return addToTokenDict(startDict, token[0]);
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
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (
                        getPatternListMinLength(token.patterns, {}, {}, context)
                    )
                        return startDict;
                    break;
                case "multi":
                    startDict = addTokenDicts(
                        startDict,
                        getPatternStartDict(
                            token.pattern,
                            parentCalls,
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (
                        token.min &&
                        getPatternMinLength(token.pattern, {}, {}, context)
                    )
                        return startDict;
                    break;
                case "anychar":
                    return addTokenDicts(startDict, token.tokenDict);
                case "subcontext":
                    startDict = addTokenDicts(
                        startDict,
                        getSubcontextStartDict(
                            token,
                            parentCalls,
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (getSubcontextMinLength(token, {}, {}, context))
                        return startDict;
                    break;
            }
        } else {
            startDict = addTokenDicts(
                startDict,
                getTypeStartDict(
                    token.type,
                    { ...parentCalls },
                    cache,
                    context,
                    toAddHeuristics
                )
            );

            // if the minimum length is > 0, no need to check any further
            if (toAddHeuristics.minLength[token.type]) return startDict;
        }
    }
    return startDict;
};

const getSubcontextStartDict = (
    subcontextToken,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    if (context.parentContexts[subcontextToken.subcontextId])
        return getPatternStartDict(
            subcontextToken.pattern,
            parentCalls,
            cache,
            context,
            toAddHeuristics
        );

    return getPatternStartDict(
        subcontextToken.pattern,
        {},
        {},
        subcontextToken.getSubcontext(),
        makeToAddHeuristics(subcontextToken.getSubcontext().heuristics)
    );
};

/*************************
 * End Dict functions
 *************************/

const getEndDicts = (context, toAddHeuristics) => {
    const dicts = {};
    for (const type in context.rules) {
        dicts[type] = getTypeEndDict(
            type,
            undefined,
            undefined,
            context,
            toAddHeuristics
        );
    }
    return dicts;
};

const getTypeEndDict = (
    type,
    parentCalls = {},
    cache = {},
    context,
    toAddHeuristics
) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = newTokenDict();
        return cache[type];
    }
    parentCalls[type] = true;
    cache[type] = getPatternListEndDict(
        getAllRules(type, context).map(({ pattern }) => pattern),
        parentCalls,
        cache,
        context,
        toAddHeuristics
    );
    return cache[type];
};

const getPatternListEndDict = (
    patternList,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    let endDict = newTokenDict();
    for (const pattern of patternList) {
        endDict = addTokenDicts(
            endDict,
            getPatternEndDict(
                pattern,
                parentCalls,
                cache,
                context,
                toAddHeuristics
            )
        );
    }
    return endDict;
};

const getPatternEndDict = (
    pattern,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    let endDict = newTokenDict();
    for (let i = pattern.length - 1; i >= 0; i--) {
        const token = pattern[i];
        if (isTerminal(token)) {
            // if the minimum length is > 0, no need to check any further
            if (token.length)
                return addToTokenDict(endDict, token[token.length - 1]);
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
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (
                        getPatternListMinLength(token.patterns, {}, {}, context)
                    )
                        return endDict;
                    break;
                case "multi":
                    endDict = addTokenDicts(
                        endDict,
                        getPatternEndDict(
                            token.pattern,
                            parentCalls,
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (
                        token.min &&
                        getPatternMinLength(token.pattern, {}, {}, context)
                    )
                        return endDict;
                    break;
                case "anychar":
                    return addTokenDicts(endDict, token.tokenDict);
                case "subcontext":
                    endDict = addTokenDicts(
                        endDict,
                        getSubcontextEndDict(
                            token,
                            parentCalls,
                            cache,
                            context,
                            toAddHeuristics
                        )
                    );
                    // if the minimum length is > 0, no need to check any further
                    if (getSubcontextMinLength(token, {}, {}, context))
                        return endDict;
                    break;
            }
        } else {
            endDict = addTokenDicts(
                endDict,
                getTypeEndDict(
                    token.type,
                    { ...parentCalls },
                    cache,
                    context,
                    toAddHeuristics
                )
            );

            // if the minimum length is > 0, no need to check any further
            if (toAddHeuristics.minLength[token.type]) return endDict;
        }
    }
    return endDict;
};
const getSubcontextEndDict = (
    subcontextToken,
    parentCalls,
    cache,
    context,
    toAddHeuristics
) => {
    if (context.parentContexts[subcontextToken.subcontextId])
        return getPatternEndDict(
            subcontextToken.pattern,
            parentCalls,
            cache,
            context,
            toAddHeuristics
        );

    return getPatternEndDict(
        subcontextToken.pattern,
        {},
        {},
        subcontextToken.getSubcontext(),
        makeToAddHeuristics(subcontextToken.getSubcontext().heuristics)
    );
};

export default generateHeuristics;

// SORT OF A HACK BUT IT WAS EASY
const makeToAddHeuristics = (heuristics) => {
    // Need to take a NORMAl heuristics object and turn it into this form (ALL I NEED IS MINLENGTH HERE)
    const minLength = {};
    for (const type in heuristics.types) {
        minLength[type] = heuristics.types[type].minLength;
    }
    return { minLength };
};
