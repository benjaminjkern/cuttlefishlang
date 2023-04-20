import { type, OR, thisType, genericType } from "../../parse/ruleUtils.js";
import { inspect } from "../../util/specialUtils.js";

export const objectGenerics = [
    // Needs to be at the top so it grabs as much as possible
    "Function",
    // Temporarily put these here so that it can catch it, needs to be before number
    "Integer",
    "Number",
    "String",
    "Boolean",
    // Temporarily put these here so that it can catch it, needs to be before iterable
    "DiscreteRange",
    // Temporarily put these here so that it can catch it, needs to be before iterable
    "List",
    "Iterable",
    "Dictionary",
];

export default {
    Object: [
        {
            pattern: ["(", thisType(), ")"],
            evaluate: ({ tokens: [_, token], context }) =>
                context.evaluateExpression(token),
        },
        {
            pattern: [type("Dictionary", thisType()), ".", type("varName")],
            evaluate: ({ tokens: [dict, _, variable], context }) =>
                context.evaluateExpression(dict)[
                    context.evaluateExpression(variable)
                ],
        },
        {
            pattern: [
                type("Dictionary", thisType()),
                "[",
                OR(type("String"), type("Number")),
                "]",
            ],
            evaluate: ({ tokens: [dict, _, exp], context }) =>
                context.evaluateExpression(dict)[
                    context.evaluateExpression(exp)
                ],
        },
        {
            pattern: [type("Iterable", thisType()), "[", type("Integer"), "]"],
            evaluate: ({ tokens: [iterable, _, index], context }) =>
                context
                    .evaluateExpression(iterable)
                    .getIndex(context.evaluateExpression(index)),
        },
        {
            pattern: [
                type("Function", genericType("A"), thisType()),
                type("Object"),
                // genericType("A"),
            ], // The A's must match
            genericTypes: {
                A: "Object",
            },
            evaluate: ({ tokens: [func, argument], context }) => {
                return context
                    .evaluateExpression(func)
                    .call(context.evaluateExpression(argument));
            },
        },
        {
            pattern: [
                type("Function", genericType("A"), thisType()),
                "(",
                ")",
                // genericType("A"),
            ], // The A's must match
            genericTypes: {
                A: "Object",
            },
            evaluate: ({ tokens: [func], context }) => {
                return context.evaluateExpression(func).call();
            },
        },
    ],
};
