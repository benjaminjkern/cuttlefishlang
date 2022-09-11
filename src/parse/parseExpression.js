const { HEURISTICS, getPatternMinLength } = require("./heuristics");
const RULES = require("../expressions");

const { isTerminal } = require("../util/parsingUtils");
const { inspect } = require("../util");
const { isValidToken } = require("./tokenDict");

const parseExpressionAsType = (type, expression) => {
    const typeHeuristics = checkTypeHeuristics(type, expression);
    if (typeHeuristics.error) return typeHeuristics;

    for (const rule of RULES[type]) {
        const parse = parseExpressionAsPattern(rule.pattern, expression);
        if (parse.error) continue;
        return { type, children: parse };
    }
    return {
        error: `"${expression}" did not match any pattern of type: ${type}!`,
    };
};

const parseExpressionAsMetaType = (metaTypePatternToken, expression) => {
    // console.log(inspect(metaTypePatternToken), expression);
    switch (metaTypePatternToken.metaType) {
        case "or":
            for (const pattern of metaTypePatternToken.patterns) {
                const parse = parseExpressionAsPattern(pattern, expression);
                if (parse.error) continue;
                return parse;
            }
            return {
                error: `"${expression}" did not match any pattern in list: ${metaTypePatternToken.patterns}!`,
            };
        case "multi":
            if (metaTypePatternToken.min <= 0 && expression === "") return [];
            if (metaTypePatternToken.max <= 0 && expression !== "")
                return { error: "Maximum length reached" };
            const parse = parseExpressionAsPattern(
                [
                    ...metaTypePatternToken.pattern,
                    {
                        ...metaTypePatternToken,
                        min: Math.max(metaTypePatternToken.min - 1, 0),
                        max: Math.max(metaTypePatternToken.max - 1, 0),
                    },
                ],
                expression
            );
            if (parse.error) return parse;
            return parse.flat();
        case "anychar":
            if (!isValidToken(metaTypePatternToken.tokenDict, expression))
                return {
                    error: `There do not exist any possible matches of "${expression}" on pattern ${metaTypePatternToken}!`,
                };
            return expression;
    }
    return { error: `Invalid metaType: ${metaTypePatternToken.metaType}` };
};

const parseExpressionAsPattern = (pattern, expression) => {
    const possibleMatches = getPossibleMatches(pattern, expression);
    if (possibleMatches.length === 0)
        return {
            error: `There do not exist any possible matches of "${expression}" on pattern ${pattern}!`,
        };

    nextBreakPoint: for (const breakpointList of possibleMatches) {
        const match = [];
        for (const [i, patternToken] of pattern.entries()) {
            const subExpression = expression.slice(
                breakpointList[i - 1] || 0,
                breakpointList[i]
            );

            // This should be redundant
            if (isTerminal(patternToken)) {
                if (patternToken !== subExpression) continue nextBreakPoint;
                match.push(patternToken);
                continue;
            }
            if (patternToken.metaType) {
                const parse = parseExpressionAsMetaType(
                    patternToken,
                    subExpression
                );
                if (parse.error) continue nextBreakPoint;
                match.push(parse);
                continue;
            }

            const parse = parseExpressionAsType(
                patternToken.type,
                subExpression
            );
            if (parse.error) continue nextBreakPoint;
            match.push(parse);
        }

        return match;
    }
    return {
        error: `All possible matches of "${expression}" on pattern ${pattern} failed.`,
    };
};

const checkTypeHeuristics = (type, expression) => {
    for (const heuristic in HEURISTICS.typeHeuristics) {
        const heuristicCheck = HEURISTICS.typeHeuristics[heuristic](
            type,
            expression
        );
        if (heuristicCheck.error) return heuristicCheck;
    }

    return {};
};

const checkMetaTypeHeuristics = (metaType, expression) => {
    // Might want to do this at some point but honestly I think its fine
    return true;
};

const patternMinLength = (pattern) => {
    return getPatternMinLength(pattern, {}, {});
    return pattern.reduce(
        (p, token) =>
            p +
            (isTerminal(token)
                ? token.length
                : HEURISTICS.types[token.type].minLength),
        0
    );
};

const getPossibleMatches = (pattern, expression) => {
    // If the pattern doesnt have any tokens left, either the expression should also be empty or there should be no matches
    if (pattern.length === 0) return expression.length === 0 ? [[]] : [];

    if (expression.length < patternMinLength(pattern)) return [];

    const firstPatternToken = pattern[0];
    if (isTerminal(firstPatternToken)) {
        // This is checked again later but it at least saves us on some memory and time
        if (expression.slice(0, firstPatternToken.length) !== firstPatternToken)
            return [];

        return getPossibleMatches(
            pattern.slice(1),
            expression.slice(firstPatternToken.length)
        ).map((match) => [
            firstPatternToken.length,
            ...match.map((len) => len + firstPatternToken.length),
        ]);
    }

    const matches = [];
    for (let i = 0; i <= expression.length; i++) {
        if (firstPatternToken.type) {
            const typeHeuristics = checkTypeHeuristics(
                firstPatternToken.type,
                expression.slice(0, i)
            );
            if (typeHeuristics.error) continue;
        } else {
            const typeHeuristics = checkMetaTypeHeuristics(
                firstPatternToken,
                expression.slice(0, i)
            );
            if (typeHeuristics.error) continue;
        }

        matches.push(
            ...getPossibleMatches(pattern.slice(1), expression.slice(i)).map(
                (match) => [i, ...match.map((len) => len + i)]
            )
        );
    }
    return matches;
};

module.exports = parseExpressionAsType;

console.log(
    inspect(parseExpressionAsType("A", "ooo799aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"))
);
