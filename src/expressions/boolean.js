import { evaluateExpression } from "../parse/evaluate.js";
import { type } from "../parse/ruleUtils.js";
import { newRuleList } from "./index.js";

newRuleList("Boolean", [
    {
        pattern: [type("Boolean"), "or", type("Boolean")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) || evaluateExpression(b),
    },
    {
        pattern: [type("Boolean"), "and", type("Boolean")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) && evaluateExpression(b),
    },
    {
        pattern: [type("Boolean"), "xor", type("Boolean")],
        evaluate: ({ tokens: [a, _, b] }) =>
            // A little confusing, "Boolean" here is the JavaScript function
            Boolean(evaluateExpression(a) ^ evaluateExpression(b)),
    },
    {
        pattern: ["not", type("Boolean")],
        evaluate: ({ tokens: [_, a] }) => !evaluateExpression(a),
    },
    {
        pattern: [type("Number"), "<", type("Number")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) < evaluateExpression(b),
    },
    {
        pattern: [type("Number"), "<=", type("Number")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) <= evaluateExpression(b),
    },
    {
        pattern: [type("Number"), ">", type("Number")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) > evaluateExpression(b),
    },
    {
        pattern: [type("Number"), ">=", type("Number")],
        evaluate: ({ tokens: [a, _, b] }) =>
            evaluateExpression(a) >= evaluateExpression(b),
    },
    { pattern: [type("boollit")] },
]);

newRuleList("boollit", [
    {
        pattern: ["true"],
        evaluate: () => true,
    },
    {
        pattern: ["false"],
        evaluate: () => false,
    },
]);
