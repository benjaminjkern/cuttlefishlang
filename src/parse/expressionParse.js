const parseType = (type, expression) => {
    if (!matchToType(type, expression)) return false;
    if (
        expression.length === 1 &&
        !isTerminal(expression[0]) &&
        type === expression[0].type
    )
        return true;
    for (const rule of RULES[type]) {
        if (parseExpression(rule.pattern, expression)) return true;
    }
    return false;
};

const parseExpression = (pattern, expression) => {
    const possibleRegexes = allMatches(pattern, expression);
    if (possibleRegexes.length === 0) return false;
    for (const lengths of possibleRegexes) {
        if (
            pattern.every((patternToken, i) => {
                const expectedExpression = expression.slice(
                    lengths[i - 1] || 0,
                    lengths[i]
                );
                if (isTerminal(patternToken))
                    return patternToken === expectedExpression[0];
                return parseType(patternToken.type, expectedExpression);
            })
        )
            return true;
    }
    return false;
};

const allMatches = (pattern, expression) => {
    if (pattern.length === 0) return expression.length === 0 ? [[]] : [];

    if (
        pattern.reduce(
            (p, token) =>
                p + (isTerminal(token) ? 1 : HEURISTICS[token.type].minLength),
            0
        ) > expression.length
    )
        return [];

    if (isTerminal(pattern[0]))
        return allMatches(pattern.slice(1), expression.slice(1)).map(
            (match) => [1, ...match.map((len) => len + 1)]
        );

    const matches = [];
    for (let i = 0; i <= expression.length; i++) {
        if (matchToType(pattern[0].type, expression.slice(0, i)))
            matches.push(
                ...allMatches(pattern.slice(1), expression.slice(i)).map(
                    (match) => [i, ...match.map((len) => len + i)]
                )
            );
    }
    return matches;
};

const matchToType = (type, expression) => {
    const regex = HEURISTICS[type];

    if (expression.length < regex.minLength) return false;
    if (!regex.startTokens[forceTerminal(expression[0])]) return false;
    if (!regex.endTokens[forceTerminal(expression[expression.length - 1])])
        return false;
    return expression.every((token) => regex.dict[forceTerminal(token)]);
};
