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
                    type("Iterable"),
                    type("Dictionary")
                ),
            ],
        },
        {
            pattern: [type("Dictionary"), ".", type("varName")],
            spaces: "specify",
        },
    ],
    Dictionary: [{ pattern: [type("dictlit")] }],
    dictlit: [{ pattern: ["{", "}"] }],
};
