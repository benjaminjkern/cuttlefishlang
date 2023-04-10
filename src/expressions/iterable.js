import { evaluateExpression } from "../parse/evaluate.js";
import { type, OPTIONAL, MULTI } from "../parse/ruleUtils.js";
import { inspect } from "../util/index.js";
import { newRuleList } from "./index.js";

newRuleList("Iterable", [
    {
        pattern: [type("Iterable"), "++", type("Iterable")],
        evaluate: ({ tokens: [a, _, b] }) => [
            ...evaluateExpression(a),
            ...evaluateExpression(b),
        ],
    },
    { pattern: [type("listlit")] },
]);

newRuleList("listlit", [
    {
        pattern: ["[", OPTIONAL(type("commaSeparatedObjects")), "]"],
        evaluate: ({ tokens: [_, a] }) => evaluateExpression(a),
    },
]);

newRuleList("commaSeparatedObjects", [
    {
        pattern: [
            type("Object"),
            MULTI([",", MULTI(type("space")), type("Object")]),
            OPTIONAL(","),
        ],
        evaluate: ({ tokens: [head, [commas, spaces, rest]] }) => {
            return [evaluateExpression(head), ...rest.map(evaluateExpression)];
        },
    },
]);
