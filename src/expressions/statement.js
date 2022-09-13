const evaluateExpression = require("../parse/evaluateExpression");
const { type, OR } = require("../parse/ruleUtils");

module.exports = {
    Statement: [
        {
            pattern: [
                "print ",
                OR(type("String"), type("Number"), type("Boolean")),
            ],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue);
            },
        },
    ],
};
