const { evaluateExpression } = require("../parse/evaluate");
const {
    newParseVariable,
    setVariable,
    setContext,
} = require("../parse/parseExpression");
const { type, OR, MULTI, ANYCHAR } = require("../parse/ruleUtils");

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
            pattern: ["print", type("Iterable")],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue);
            },
        },
        {
            pattern: [type("varName"), "=", type("Object")],
            onParse: ({ tokens: [id, _, obj] }) => {
                newParseVariable(obj.tokens[0][0].type, id.sourceString);
            },
            evaluate: ({ tokens: [id, _, obj] }) => {
                setVariable(id.sourceString, evaluateExpression(obj));
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
        },
    ],
};
