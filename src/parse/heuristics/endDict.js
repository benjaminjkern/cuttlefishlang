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
