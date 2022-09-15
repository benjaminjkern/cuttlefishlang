const { evaluateExpression } = require("../parse/evaluate");
const { NOTCHAR, MULTI, type, OR } = require("../parse/ruleUtils");
module.exports = {
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
                evaluateExpression(a) + "" + (evaluateExpression(b) + ""),
        },
    ],
    stringlike: [
        { pattern: [OR(type("Number"), type("String"), type("Boolean"))] },
    ],
};
