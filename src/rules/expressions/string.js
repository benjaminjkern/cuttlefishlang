import { evaluateExpression } from "../../evaluate/evaluate.js";
import { NOTCHAR, MULTI, type, OR } from "../../parse/ruleUtils.js";

export default {
    String: [
        {
            pattern: ['"', MULTI(NOTCHAR('"')), '"'],
            spaces: "specify",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
        {
            pattern: ["'", MULTI(NOTCHAR('"')), "'"],
            spaces: "specify",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
        {
            // TODO: Unsure if I want these to be stringlikes or strictly strings (Difference = Automatic casting of numbers and booleans as strings here)
            pattern: [type("stringlike"), "++", type("stringlike")],
            evaluate: ({ tokens: [a, _, b] }) =>
                `${evaluateExpression(a)}${evaluateExpression(b)}`,
        },
        {
            pattern: [type("stringlike"), "**", type("Integer")],
            evaluate: ({ tokens: [string, _, n] }) => {
                const num = evaluateExpression(n);
                const inputString = evaluateExpression(string);
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
