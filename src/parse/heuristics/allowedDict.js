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
