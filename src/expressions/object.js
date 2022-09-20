const {
    evaluateExpression,
    evaluateStatementList,
} = require("../parse/evaluate");
const { type, OR } = require("../parse/ruleUtils");

module.exports = {
    Object: [
        {
            pattern: [
                OR(
                    type("Number"),
                    type("String"),
                    type("Boolean"),
                    type("Iterable")
                ),
            ],
        },
    ],
};
