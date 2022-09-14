const {
    evaluateExpression,
    evaluateStatementList,
} = require("../parse/evaluate");
const { type, OR } = require("../parse/ruleUtils");

module.exports = {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], children }) => {
                if (evaluateExpression(test)) evaluateStatementList(children);
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], children }) => {
                while (evaluateExpression(test))
                    evaluateStatementList(children);
            },
        },
    ],
};
