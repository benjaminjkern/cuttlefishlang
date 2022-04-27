const RULES = {
    N: [
        {
            pattern: [{ type: "N" }, "-", { type: "N" }],
        },
        {
            pattern: [{ type: "N" }, { type: "N" }],
        },
        {
            pattern: ["-", { type: "N" }],
        },
        {
            pattern: ["n"],
        },
    ],
};

const parseType = (type, expression) => {
    // Optimization
    const typeHeuristics = checkTypeHeuristics(type, expression);
    if (typeHeuristics.error) return typeHeuristics;

    for (const rule of RULES[type]) {
        const parse = parseExpression(rule.pattern, expression);
        if (parse.error) continue;
        return parse;
    }
    return {
        error: `"${expression}" did not match any pattern of type: ${type}!`,
    };
};

const checkTypeHeuristics = (type, expression) => {
    const heuristics = HEURISTICS[type];

    if (expression.length < heuristics.minLength)
        return {
            error: `"${expression}" is shorter than the minimum possible length (${heuristics.minLength}) for type: ${type}!"`,
        };
    if (expression.length < heuristics.maxLength)
        return {
            error: `"${expression}" is shorter than the maximum possible length (${heuristics.maxLength}) for type: ${type}!"`,
        };

    if (!heuristics.startTokens[forceTerminal(expression[0])])
        return {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!"`,
        };
    if (!heuristics.endTokens[forceTerminal(expression[expression.length - 1])])
        return {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!"`,
        };

    for (const token of expression) {
        if (heuristics.dict[forceTerminal(token)])
            return {
                error: `'${token}' is not in the set of allowed tokens for type: ${type}!"`,
            };
    }

    return {};
};

const parseExpression = (pattern, expression) => {
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
            if (isTerminal(patternToken)) {
                if (patternToken !== subExpression) continue nextBreakPoint;
                continue;
            }
            const parse = parseType(patternToken.type, subExpression);
            if (parse.error) continue nextBreakPoint;
            match.push(parse);
        }

        return match;
    }
    return {
        error: `All possible matches of "${expression}" on pattern ${pattern} failed.`,
    };
};

const patternMinLength = (pattern) => {
    return pattern.reduce(
        (p, token) =>
            p +
            (isTerminal(token)
                ? token.length
                : HEURISTICS[token.type].minLength),
        0
    );
};

// This is different so that it can break out when it sees the max value
const patternMaxLength = (pattern) => {
    let runningTotal = 0;
    for (const token of pattern) {
        if (isTerminal(token)) runningTotal += token.length;
        else if (HEURISTICS[token.type].maxLength >= Number.MAX_SAFE_INTEGER)
            return Number.MAX_SAFE_INTEGER;
        else runningTotal += HEURISTICS[token.type].maxLength;
    }
    return runningTotal;
};

const getPossibleMatches = (pattern, expression) => {
    // If the pattern doesnt have any tokens left, either the expression should also be empty or there should be no matches
    if (pattern.length === 0) return expression.length === 0 ? [[]] : [];

    if (expression.length < patternMinLength(pattern)) return [];
    if (expression.length > patternMaxLength(pattern)) return [];

    const firstPatternToken = pattern[0];
    if (isTerminal(firstPatternToken))
        return getPossibleMatches(
            pattern.slice(1),
            expression.slice(firstPatternToken.length)
        ).map((match) => [
            firstPatternToken.length,
            ...match.map((len) => len + firstPatternToken.length),
        ]);

    const matches = [];
    for (let i = 0; i <= expression.length; i++) {
        const typeHeuristics = checkTypeHeuristics(
            firstPatternToken.type,
            expression.slice(0, i)
        );
        if (typeHeuristics.error) continue;

        matches.push(
            ...getPossibleMatches(pattern.slice(1), expression.slice(i)).map(
                (match) => [i, ...match.map((len) => len + i)]
            )
        );
    }
    return matches;
};

const isTerminal = (token) =>
    typeof token !== "object" || !token.type || !RULES[token.type];
