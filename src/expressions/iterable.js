const { evaluateExpression } = require("../parse/evaluate");
const { type, OPTIONAL, MULTI } = require("../parse/ruleUtils");
const { inspect } = require("../util");

module.exports = {
    Iterable: [
        {
            pattern: [type("Iterable"), "++", type("Iterable")],
            evaluate: ({ tokens: [a, _, b] }) => [
                ...evaluateExpression(a),
                ...evaluateExpression(b),
            ],
        },
        { pattern: [type("listlit")] },
    ],
    listlit: [
        {
            pattern: ["[", OPTIONAL(type("commaSeparatedObjects")), "]"],
            evaluate: ({ tokens: [_, a] }) => evaluateExpression(a),
        },
    ],
    commaSeparatedObjects: [
        {
            pattern: [
                type("Object"),
                MULTI([",", MULTI(type("space")), type("Object")]),
                OPTIONAL(","),
            ],
            evaluate: ({ tokens: [head, [commas, spaces, rest]] }) => {
                return [
                    evaluateExpression(head),
                    ...rest.map(evaluateExpression),
                ];
            },
        },
    ],
};
