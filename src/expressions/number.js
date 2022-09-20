const { evaluateExpression } = require("../parse/evaluate");
const { MULTI, OPTIONAL, type, OR } = require("../parse/ruleUtils");

module.exports = {
    Number: [
        {
            pattern: ["(", type("Number"), ")"],
            evaluate: ({ tokens: [_, a] }) => evaluateExpression(a),
        },
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
