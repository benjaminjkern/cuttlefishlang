const { evaluateExpression } = require("../parse/evaluate");
const {
    newParseVariable,
    setVariable,
    setContext,
    getContext,
} = require("../parse/parseExpression");
const { type, OR, MULTI, ANYCHAR } = require("../parse/ruleUtils");
const { CuttlefishError } = require("../util");

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
        {
            pattern: ["break"],
            onParse: ({ lineNumber }) => {
                const inLoop = getContext("inLoop");
                if (!inLoop || !inLoop.length)
                    throw CuttlefishError(
                        lineNumber,
                        `Cannot use break outside of loop!`
                    );
            },
            evaluate: () => {
                setContext({ breakingLoop: true });
            },
        },
        {
            pattern: ["continue"],
            onParse: ({ lineNumber }) => {
                const inLoop = getContext("inLoop");
                if (!inLoop || !inLoop.length)
                    throw CuttlefishError(
                        lineNumber,
                        `Cannot use continue outside of loop!`
                    );
            },
            evaluate: () => {
                setContext({ continuingLoop: true });
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
        },
    ],
};
