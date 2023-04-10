import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type, OR } from "../../parse/ruleUtils.js";

export default {
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
            evaluate: ({ tokens: [dict, _, variable] }) =>
                evaluateExpression(dict)[evaluateExpression(variable)],
        },
        {
            pattern: [
                type("Dictionary"),
                "[",
                OR(type("String"), type("Number")),
                "]",
            ],
            evaluate: ({ tokens: [dict, _, exp] }) =>
                evaluateExpression(dict)[evaluateExpression(exp)],
        },
        {
            pattern: [type("Iterable"), "[", type("Number"), "]"],
            evaluate: ({ tokens: [iterable, _, index] }) =>
                evaluateExpression(iterable)[evaluateExpression(index)],
        },
    ],
};
