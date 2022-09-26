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
        {
            pattern: [type("Dictionary"), "[", type("String"), "]"],
            spaces: "specify",
        },
        {
            pattern: [type("Iterable"), "[", type("Number"), "]"],
            evaluate: ({ tokens: [iterable, _, index] }) =>
                evaluateExpression(iterable)[evaluateExpression(index)],
        },
    ],
    Dictionary: [{ pattern: [type("dictlit")] }],
    dictlit: [{ pattern: ["{", "}"] }],
};
