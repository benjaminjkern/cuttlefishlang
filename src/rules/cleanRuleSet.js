import { MULTI, type } from "../parse/ruleUtils.js";
import { consoleWarn } from "../util/environment.js";

/**
 * Add "extra rules" to ruleset. Right now all this does is add the spaces to patterns as a convenience so that you don't have to write them in yourself, and then it changes the associated valuate function to work correctly with these new spaces.
 * It also attaches an evaluate function to the pattern if one wasn't already defined.
 *
 * Rules for spaces:
 * - optional (default):
 *      Assume there can be an optional space (or many) in between every token. (Not on the outsides)
 * - (NOT IMPLEMENTED) optional-outside (default):
 *      Assume there can be an optional space (or many) in between every token and on the outside of the pattern.
 * - required:
 *      Assume there will always be at least one space between every token. (Not on the outsides)
 * - (NOT IMPLEMENTED) required-outside:
 *      Assume there will always be at least one space between every token and on the outside of the pattern.
 * - none:
 *      No extra spaces are added. You must specify in the pattern itself if you want spaces to be included in the pattern.
 */

const cleanRuleSet = (rules) => {
    Object.keys(rules).forEach((typeName) => {
        const ruleSet = rules[typeName];
        ruleSet.forEach((rule, i) => {
            // Force spaces, associativity, and evaluation functions
            const {
                spaces = "optional",
                evaluate = ({ tokens, context }) => {
                    if (tokens.length > 1)
                        consoleWarn(
                            `Warning: Evaluating rule ${i} in type "${typeName}" with default evaluation, ignoring all tokens aside from the first.`
                        );
                    return context.evaluateExpression(tokens[0]);
                },
                onParse,
            } = rule;
            rule.evaluate = evaluate;
            switch (spaces) {
                default: // eslint-disable-line default-case-last
                    consoleWarn(
                        `Warning: Rule ${i} in type "${typeName}" has invalid spaces configuration: "${spaces}", defaulting to default (optional).`
                    );
                case "required":
                case "optional":
                    rule.pattern = rule.pattern.flatMap((token, j) =>
                        j === rule.pattern.length - 1
                            ? token
                            : [
                                  token,
                                  MULTI(
                                      type("space"),
                                      spaces === "required" ? 1 : 0
                                  ),
                              ]
                    );
                    if (onParse) {
                        rule.onParse = ({ tokens, ...args }) => {
                            return onParse({
                                tokens: tokens.filter((_, j) => j % 2 === 0),
                                ...args,
                            });
                        };
                    }
                    rule.evaluate = ({ tokens, ...args }) => {
                        return evaluate({
                            tokens: tokens.filter((_, j) => j % 2 === 0),
                            ...args,
                        });
                    };
                case "none":
                    break;
            }
        });
    });
    return rules;
};

export default cleanRuleSet;
