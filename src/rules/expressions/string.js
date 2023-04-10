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
            pattern: [type("stringlike"), "++", type("stringlike")],
            evaluate: ({ tokens: [a, _, b] }) =>
                `${evaluateExpression(a)}${evaluateExpression(b)}`,
        },
    ],
    stringlike: [
        {
            pattern: [
                OR(
                    type("Number"),
                    type("String"),
                    type("Boolean"),
                    type("Object")
                ),
            ],
        },
    ],
};

export const forceString = (a) => a + "";
