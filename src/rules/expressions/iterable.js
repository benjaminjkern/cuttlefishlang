import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type, OPTIONAL, MULTI } from "../../parse/ruleUtils.js";

export default {
    Iterable: [
        {
            pattern: [type("Iterable"), "++", type("Iterable")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [a, _, b] }) => [
                // This will have issues when it comes to non-list iterables
                ...evaluateExpression(a),
                ...evaluateExpression(b),
            ],
        },
        // TODO: Need output types to be a union of all input types
        { pattern: [type("listlit")] },
    ],
    listlit: [
        {
            pattern: ["[", OPTIONAL(type("commaSeparatedObjects")), "]"],
            evaluate: ({ tokens: [_, a] }) => evaluateExpression(a),
        },
    ],
    commaSeparatedObjects: [
        {
            pattern: [
                type("Object"),
                MULTI([",", MULTI(type("space")), type("Object")]),
                OPTIONAL(","),
            ],
            evaluate: ({ tokens: [head, [commas, spaces, rest]] }) => {
                return [
                    evaluateExpression(head),
                    ...rest.map(evaluateExpression),
                ];
            },
        },
    ],
};
