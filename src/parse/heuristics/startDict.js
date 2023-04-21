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
