const { evaluateExpression } = require("../parse/evaluate");
const { type, OR, MULTI, ANYCHAR, RULES } = require("../parse/ruleUtils");
const { generateHeuristics } = require("../parse/heuristics");

module.exports = {
    Statement: [
        {
            pattern: [
                "print",
                OR(type("String"), type("Number"), type("Boolean")),
            ],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue);
            },
        },
        {
            pattern: [type("varName"), "=", type("Object")],
            onParse: ({ tokens: [id, _, obj] }) => {
                RULES[obj.tokens[0][0].type].push({
                    pattern: [id.sourceString],
                });
                generateHeuristics();
            },
            evaluate: ({ tokens: [id, _, obj] }) => {
                // addToContext(id, evaluateExpression(obj));
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
        },
    ],
};
