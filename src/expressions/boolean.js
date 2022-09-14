const { evaluateExpression } = require("../parse/evaluate");
const { type } = require("../parse/ruleUtils");

module.exports = {
    Boolean: [
        {
            pattern: [type("Boolean"), "or", type("Boolean")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) || evaluateExpression(b),
        },
        {
            pattern: [type("Boolean"), "and", type("Boolean")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) && evaluateExpression(b),
        },
        {
            pattern: [type("Boolean"), "xor", type("Boolean")],
            evaluate: ({ tokens: [a, _, b] }) =>
                Boolean(evaluateExpression(a) ^ evaluateExpression(b)),
        },
        {
            pattern: ["not", type("Boolean")],
            evaluate: ({ tokens: [_, a] }) => !evaluateExpression(a),
        },
        {
            pattern: [type("Number"), "<", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) < evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "<=", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) <= evaluateExpression(b),
        },
        {
            pattern: [type("Number"), ">", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) > evaluateExpression(b),
        },
        {
            pattern: [type("Number"), ">=", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) >= evaluateExpression(b),
        },
        { pattern: [type("boollit")] },
    ],
    boollit: [
        {
            pattern: ["true"],
            evaluate: () => true,
        },
        {
            pattern: ["false"],
            evaluate: () => false,
        },
    ],
};
