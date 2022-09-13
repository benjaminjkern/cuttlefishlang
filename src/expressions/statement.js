const evaluateExpression = require("../parse/evaluateExpression");
const { type } = require("../parse/ruleUtils");

module.exports = {
    Statement: [
        {
            pattern: ["print ", type("String")],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue);
            },
        },
    ],
};
