const evaluateExpression = require("../parse/evaluateExpression");
const { ANYCHAR, MULTI, OPTIONAL, type, OR } = require("../parse/ruleUtils");

module.exports = {
    Number: [
        {
            pattern: [type("Number"), "+", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) + evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "-", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) - evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "*", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) * evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "/", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) / evaluateExpression(b),
        },
        {
            pattern: [type("numlit")],
            evaluate: ({ sourceString }) => +sourceString,
        },
    ],
    numlit: [
        {
            pattern: [
                MULTI(type("digit"), 1),
                OPTIONAL(".", OPTIONAL(type("endbit"))),
            ],
            spaces: "specify",
        },
        {
            pattern: [
                MULTI(type("digit")),
                ".",
                MULTI(type("digit"), 1),
                OPTIONAL(type("endbit")),
            ],
            spaces: "specify",
        },
    ],
    endbit: [{ pattern: [OR("e", "E"), MULTI(type("digit"), 1)] }],
};
