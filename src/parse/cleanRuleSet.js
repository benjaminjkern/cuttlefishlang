const { MULTI, type } = require("../parse/ruleUtils");
const { evaluateExpression } = require("./evaluate");

/**
 * Spaces:
 * - ignore (default):
 *      Assume there can be an optional space (or many) in between every token. (Not on the outsides)
 * - require:
 *      Assume there will always be at least one space between every token. (Not on the outsides)
 * - specify:
 *      You must specify in the pattern itself if you want spaces to be included in the pattern.
 */

const cleanRuleSet = (rules) => {
    Object.keys(rules).forEach((typeName) => {
        const ruleSet = rules[typeName];
        ruleSet.forEach((rule, i) => {
            // Force spaces, associativity, and evaluation functions
            const {
                spaces = "ignore",
                evaluate = ({ tokens }) => {
                    if (tokens.length > 1)
                        console.warn(
                            `Warning: Evaluating rule ${i} in type "${typeName}" with default evaluation, ignoring all tokens aside from the first.`
                        );
                    return evaluateExpression(tokens[0]);
                },
            } = rule;
            rule.evaluate = evaluate;
            switch (spaces) {
                default:
                    console.warn(
                        `Warning: Rule ${i} in type "${typeName}" has invalid spaces configuration: "${spaces}", defaulting to default (ignore).`
                    );
                case "require":
                case "ignore":
                    rule.pattern = rule.pattern.flatMap((token, i) =>
                        i === rule.pattern.length - 1
                            ? token
                            : [
                                  token,
                                  MULTI(
                                      type("space"),
                                      spaces === "require" ? 1 : 0
                                  ),
                              ]
                    );
                    rule.evaluate = ({ tokens, ...args }) => {
                        return evaluate({
                            tokens: tokens.filter((_, i) => i % 2 === 0),
                            ...args,
                        });
                    };
                case "specify":
                    break;
            }
        });
    });
    return rules;
};

module.exports = cleanRuleSet;
