import { NOTCHAR, MULTI, type, OR } from "../../parse/ruleUtils.js";

export default {
    String: [
        {
            pattern: ['"', MULTI(NOTCHAR('"')), '"'],
            spaces: "none",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
        {
            pattern: ["'", MULTI(NOTCHAR('"')), "'"],
            spaces: "none",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
        {
            // TODO: Unsure if I want these to be stringlikes or strictly strings (Difference = Automatic casting of numbers and booleans as strings here)
            pattern: [type("stringlike"), "++", type("stringlike")],
            evaluate: ({ tokens: [a, _, b], context }) =>
                `${context.evaluateExpression(a)}${context.evaluateExpression(
                    b
                )}`,
        },
        {
            pattern: [type("stringlike"), "**", type("Integer")],
            evaluate: ({ tokens: [string, _, n], context }) => {
                const num = context.evaluateExpression(n);
                const inputString = context.evaluateExpression(string);
                return Array(num).fill(inputString).join("");
            },
        },
    ],
    stringlike: [
        {
            pattern: [
                OR(
                    type("Number"),
                    type("String"),
                    type("Boolean")
                    // type("Object") (I dont think I need or want this)
                ),
            ],
        },
    ],
};

export const forceString = (a) => a + "";
