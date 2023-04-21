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

const minLengthHeuristic = newHeuristic(
    Number.MAX_SAFE_INTEGER,
    0,
    Math.min,
    (current, next) => current + next,
    (min) => min === 0,
    (token) => token.length
);

const getPatternMinLength = (pattern, parentCalls, cache, context) => {};
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
