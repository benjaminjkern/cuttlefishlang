import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type, OR } from "../../parse/ruleUtils.js";

addGenerics("Object", [
    "Number",
    "String",
    "Boolean",
    "Iterable",
    "Dictionary",
]);

export default {
    Object: [
        // {
        //     pattern: [
        //         OR(
        //             type("Number"),
        //             type("String"),
        //             type("Boolean"),
        //             type("Iterable"),
        //             type("Dictionary")
        //         ),
        //     ],
        // },
        { pattern: ["(", thisType(), ")"] },
        {
            pattern: [type("Dictionary", thisType()), ".", type("varName")],
            evaluate: ({ tokens: [dict, _, variable] }) =>
                evaluateExpression(dict)[evaluateExpression(variable)],
        },
        {
            pattern: [
                type("Dictionary", thisType()),
                "[",
                OR(type("String"), type("Number")),
                "]",
            ],
            evaluate: ({ tokens: [dict, _, exp] }) =>
                evaluateExpression(dict)[evaluateExpression(exp)],
        },
        {
            pattern: [type("Iterable", thisType()), "[", type("Integer"), "]"],
            evaluate: ({ tokens: [iterable, _, index] }) =>
                evaluateExpression(iterable)[evaluateExpression(index)],
        },
        {
            pattern: [
                type("Function", genericType("A"), thisType()),
                genericType("A"),
            ], // The A's must match
            genericTypes: {
                A: "Object",
            },
            evaluate: ({ tokens: [iterable, _, index] }) =>
                evaluateExpression(iterable)[evaluateExpression(index)],
        },
    ],
};
