import { debugFunction, inspect } from "../util/index.js";
import { getAllRules, makeTypeKey } from "./genericUtils.js";
import {
    isTerminal,
    stringifyPattern,
    stringifyToken,
} from "./parsingUtils.js";
import { isValidToken } from "./heuristics/tokenDict.js";

const stringifyParseResult = (result) => {
    if (result.error) return `Error: ${result.error}`;
    return "Parsed";
    // return stringifyToken(result);
};

/**********************
 * Parse functions
 **********************/

export const parseExpressionAsType = debugFunction(
    (typeToken, expression, lineNumber, context) => {
        if (!context.rules[typeToken.type])
            return { error: `Invalid type: ${typeToken.type}` };

        const typeHeuristics = checkTypeHeuristics(
            typeToken,
            expression,
            context
        );
        if (typeHeuristics.error) return typeHeuristics;

        for (const rule of getAllRules(typeToken, context)) {
            const parse = parseExpressionAsPattern(
                rule.pattern,
                expression,
                rule,
                lineNumber,
                context
            );
            if (parse.error) continue;
            const obj = {
                type: typeToken,
                tokens: parse,
                evaluate: rule.evaluate,
                sourceString: expression,
                lineNumber,
            };
            if (rule.onParse) rule.onParse(obj, context);
            return obj;
        }
        return {
            error: `"${expression}" did not match any pattern of type: ${makeTypeKey(
                typeToken
            )}!`,
        };
    },
    "parseExpressionAsType",
    [stringifyToken, stringifyToken],
    stringifyParseResult
);

const parseExpressionAsMetaType = debugFunction(
    (metaTypePatternToken, expression, lineNumber, context) => {
        switch (metaTypePatternToken.metaType) {
            case "or":
                for (const pattern of metaTypePatternToken.patterns) {
                    const parse = parseExpressionAsPattern(
                        pattern,
                        expression,
                        undefined,
                        lineNumber,
                        context
                    );
                    if (parse.error) continue;
                    return parse;
                }
                return {
                    error: `"${expression}" did not match any pattern in list: ${stringifyToken(
                        metaTypePatternToken
                    )}!`,
                };
            case "multi":
                if (metaTypePatternToken.min <= 0 && expression === "")
                    return [];
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
                    undefined,
                    lineNumber,
                    context
                );
                if (parse.error) return parse;
                return compactifyMulti(metaTypePatternToken.pattern, parse);
            case "anychar":
                if (!isValidToken(metaTypePatternToken.tokenDict, expression))
                    return {
                        error: `There do not exist any possible matches of "${expression}" on pattern ${stringifyPattern(
                            [metaTypePatternToken]
                        )}!`,
                    };
                return expression;
            case "subcontext":
                return parseExpressionAsPattern(
                    metaTypePatternToken.pattern,
                    expression,
                    undefined,
                    lineNumber,
                    metaTypePatternToken.getSubcontext()
                );
        }
        return { error: `Invalid metaType: ${metaTypePatternToken.metaType}` };
    },
    "parseExpressionAsMetatype",
    [stringifyToken, stringifyToken],
    stringifyParseResult
);

const parseExpressionAsPattern = debugFunction(
    (pattern, expression, rule, lineNumber, context) => {
        const possibleMatches = getPossibleMatches(
            pattern,
            expression,
            context
        );
        if (possibleMatches.length === 0)
            return {
                error: `There do not exist any possible matches of "${expression}" on pattern ${stringifyPattern(
                    pattern
                )}!`,
            };

        if (rule && rule.associativityReverseSearchOrder)
            possibleMatches.reverse();

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
                        lineNumber,
                        context
                    );
                    if (parse.error) continue nextBreakPoint;
                    match.push(parse);
                    continue;
                }

                const parse = parseExpressionAsType(
                    patternToken,
                    subExpression,
                    lineNumber,
                    context
                );
                if (parse.error) continue nextBreakPoint;
                match.push(parse);
            }

            return match;
        }
        return {
            error: `All possible matches of "${expression}" on pattern ${stringifyPattern(
                pattern
            )} failed.`,
        };
    },
    "parseExpressionAsPattern",
    [stringifyPattern, stringifyToken],
    stringifyParseResult
);

const checkTypeHeuristics = (typeToken, expression, context) => {
    for (const heuristic in context.heuristics) {
        const heuristicCheck = context.heuristics[
            heuristic
        ].tests.fromTypeToken(typeToken, expression);
        if (heuristicCheck.error) return heuristicCheck;
    }

    return {};
};

const checkMetaTypeHeuristics = (metaTypePatternToken, expression, context) => {
    if (metaTypePatternToken.metaType === "anychar") {
        if (
            expression.length !== 1 ||
            !isValidToken(metaTypePatternToken.tokenDict, expression)
        )
            return {
                error: `There do not exist any possible matches of "${expression}" on pattern ${stringifyPattern(
                    [metaTypePatternToken]
                )}!`,
            };
        return {};
    }
    if (metaTypePatternToken.metaType === "subcontext") {
        return checkMetaTypeHeuristics(
            {
                ...metaTypePatternToken,
                metaType: "multi",
                min: 1,
                max: 1,
                ignoreWeirdMulti: true,
            },
            expression,
            metaTypePatternToken.getSubcontext()
        );
    }

    // I marked this as slow at one point but it saved on a certain type of parsing at one point so I think its good to leave in
    for (const heuristic in context.heuristics) {
        const heuristicCheck = context.heuristics[heuristic].tests.fromPattern(
            [metaTypePatternToken],
            expression
        );
        if (heuristicCheck.error) return heuristicCheck;
    }
    return {};
};

const getPossibleMatches = debugFunction(
    (pattern, expression, context) => {
        // If the pattern doesnt have any tokens left, either the expression should also be empty or there should be no matches
        if (pattern.length === 0) return expression.length === 0 ? [[]] : [];

        if (
            context.heuristics.minLength.tests.fromPattern(pattern, expression)
                .error
        )
            return [];

        const firstPatternToken = pattern[0];
        if (isTerminal(firstPatternToken)) {
            // This is checked again later but it at least saves us on some memory and time
            if (
                expression.slice(0, firstPatternToken.length) !==
                firstPatternToken
            )
                return [];

            return getPossibleMatches(
                pattern.slice(1),
                expression.slice(firstPatternToken.length),
                context
            ).map((match) => [
                firstPatternToken.length,
                ...match.map((len) => len + firstPatternToken.length),
            ]);
        }

        const matches = [];
        for (let i = 0; i <= expression.length; i++) {
            if (firstPatternToken.type) {
                const typeHeuristics = checkTypeHeuristics(
                    firstPatternToken,
                    expression.slice(0, i),
                    context
                );
                if (typeHeuristics.error) continue;
            } else {
                const typeHeuristics = checkMetaTypeHeuristics(
                    firstPatternToken,
                    expression.slice(0, i),
                    context
                );
                if (typeHeuristics.error) continue;
            }

            matches.push(
                ...getPossibleMatches(
                    pattern.slice(1),
                    expression.slice(i),
                    context
                ).map((match) => [i, ...match.map((len) => len + i)])
            );
        }
        return matches;
    },
    "getPossibleMatches",
    [stringifyPattern, stringifyToken],
    (r) => r.length,
    true
);

/**
 * Used exclusively in parsing an expression as a multi-metatype,
 * I don't entirely remember what it does and i don't feel like spending time figuring it out,
 * but if I had to guess, it probably "compactifies" multi-metatypes
 */
const compactifyMulti = (pattern, parse) => {
    if (parse.length === 0) return [];
    if (parse.length === pattern.length) return parse.map((token) => token);
    const theseTokens = parse.slice(0, parse.length - 1);
    const nextTokens = compactifyMulti(pattern, parse[parse.length - 1]);
    if (nextTokens.length === 0) return theseTokens.map((token) => [token]);

    return pattern.map((token, i) => [theseTokens[i], ...nextTokens[i]]);
};
