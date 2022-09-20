const { isTerminal } = require("../util/parsingUtils");
const { inspect, deepCopy } = require("../util");
const { isValidToken } = require("./tokenDict");
const { generateHeuristics } = require("./heuristics");

let HEURISTICS,
    BASE_RULES,
    RULES,
    VARS,
    CONTEXT = {};

const setVariable = (varName, value) => {
    VARS[varName].value = value;
};

const newParseVariable = (typeName, varName) => {
    RULES = deepCopy(BASE_RULES);
    VARS[varName] = { typeName };
    setVars();
    HEURISTICS = generateHeuristics(RULES);
};

const setVars = () => {
    for (const varName in VARS) {
        RULES[VARS[varName].typeName].push({
            pattern: [varName],
            evaluate: () => VARS[varName].value,
        });
    }
};

const setContext = (newContext) => {
    CONTEXT = { ...CONTEXT, ...newContext };
};

const getContext = (key) => CONTEXT[key];

const setRules = (rules) => {
    BASE_RULES = rules;
    RULES = { ...rules };
    VARS = {};
    HEURISTICS = generateHeuristics(rules);
};

const parseExpressionAsType = (type, expression, lineNumber) => {
    if (!RULES[type]) return { error: `Invalid type: ${type}` };
    const typeHeuristics = checkTypeHeuristics(type, expression);
    if (typeHeuristics.error) return typeHeuristics;

    for (const rule of RULES[type]) {
        const parse = parseExpressionAsPattern(
            rule.pattern,
            expression,
            rule,
            lineNumber
        );
        if (parse.error) continue;
        const obj = {
            type,
            tokens: parse,
            evaluate: rule.evaluate,
            sourceString: expression,
            lineNumber,
        };
        if (rule.onParse) rule.onParse(obj);
        return obj;
    }
    return {
        error: `"${expression}" did not match any pattern of type: ${type}!`,
    };
};

const parseExpressionAsMetaType = (
    metaTypePatternToken,
    expression,
    lineNumber
) => {
    switch (metaTypePatternToken.metaType) {
        case "or":
            for (const pattern of metaTypePatternToken.patterns) {
                const parse = parseExpressionAsPattern(
                    pattern,
                    expression,
                    undefined,
                    lineNumber
                );
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
                expression,
                lineNumber
            );
            if (parse.error) return parse;
            return compactifyMulti(metaTypePatternToken.pattern, parse);
        case "anychar":
            if (!isValidToken(metaTypePatternToken.tokenDict, expression))
                return {
                    error: `There do not exist any possible matches of "${expression}" on pattern ${metaTypePatternToken}!`,
                };
            return expression;
    }
    return { error: `Invalid metaType: ${metaTypePatternToken.metaType}` };
};

const parseExpressionAsPattern = (pattern, expression, rule, lineNumber) => {
    const possibleMatches = getPossibleMatches(pattern, expression);
    if (possibleMatches.length === 0)
        return {
            error: `There do not exist any possible matches of "${expression}" on pattern ${pattern}!`,
        };

    if (rule && rule.associativityReverseSearchOrder) possibleMatches.reverse();

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
                    subExpression,
                    lineNumber
                );
                if (parse.error) continue nextBreakPoint;
                match.push(parse);
                continue;
            }

            const parse = parseExpressionAsType(
                patternToken.type,
                subExpression,
                lineNumber
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

const checkMetaTypeHeuristics = (metaTypePatternToken, expression) => {
    if (metaTypePatternToken.metaType === "anychar") {
        if (
            expression.length !== 1 ||
            !isValidToken(metaTypePatternToken.tokenDict, expression)
        )
            return {
                error: `There do not exist any possible matches of "${expression}" on pattern ${metaTypePatternToken}!`,
            };
        return {};
    }

    // Omitted since it's slow
    // for (const heuristic in HEURISTICS.metaTypeHeuristics) {
    //     const heuristicCheck = HEURISTICS.metaTypeHeuristics[heuristic](
    //         metaTypePatternToken,
    //         expression
    //     );
    //     if (heuristicCheck.error) return heuristicCheck;
    // }
    return {};
};

const patternMinLength = (pattern) => {
    return HEURISTICS.patternHeuristics.minLength(pattern);
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

const compactifyMulti = (pattern, parse) => {
    if (parse.length === 0) return [];
    if (parse.length === pattern.length) return parse.map((token) => token);
    const theseTokens = parse.slice(0, parse.length - 1);
    const nextTokens = compactifyMulti(pattern, parse[parse.length - 1]);
    if (nextTokens.length === 0) return theseTokens.map((token) => [token]);

    return pattern.map((token, i) => [theseTokens[i], ...nextTokens[i]]);
};

module.exports = {
    parseExpressionAsType,
    setContext,
    setRules,
    newParseVariable,
    setVariable,
    getContext,
};
