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
