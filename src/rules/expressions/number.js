import { evaluateExpression } from "../../evaluate/evaluate.js";
import { MULTI, OPTIONAL, OR, type } from "../../parse/ruleUtils.js";

// export const numberGenerics = ["Integer"];
export default {
    Number: [
        { pattern: [type("Integer")] },
        {
            // TODO: Encode the idea that Number + Number -> Number | Integer, but Integer + Integer -> Integer
            pattern: [type("Number"), "+", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) + evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "-", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) - evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "*", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) * evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "/", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) / evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "^", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) ** evaluateExpression(b),
        },
        {
            pattern: ["-", type("Number")],
            evaluate: ({ tokens: [_, a] }) => -evaluateExpression(a),
        },
        {
            pattern: [type("numlit")],
            evaluate: ({ sourceString }) => +sourceString,
        },
        {
            pattern: ["rand", "(", ")"],
            evaluate: () => Math.random(),
        },
    ],
    Integer: [
        // Should somehow include all the same math rules here
        {
            pattern: ["round", type("Number")],
            evaluate: ({ tokens: [_, num] }) =>
                Math.round(evaluateExpression(num)),
        },
        {
            pattern: [MULTI(type("digit"), 1)],
            spaces: "specify",
            evaluate: ({ sourceString }) => +sourceString,
        },
        {
            pattern: [type("Iterable"), ".", "length"],
            evaluate: ({ tokens: [iterable] }) => {
                return evaluateExpression(iterable).length;
            },
        },
    ],
    numlit: [
        {
            pattern: [
                MULTI(type("digit"), 1),
                OPTIONAL(".", OPTIONAL(type("endbit"))),
            ],
            spaces: "specify",
        },
        {
            pattern: [
                MULTI(type("digit")),
                ".",
                MULTI(type("digit"), 1),
                OPTIONAL(type("endbit")),
            ],
            spaces: "specify",
        },
    ],
    endbit: [{ pattern: [OR("e", "E"), MULTI(type("digit"), 1)] }],
};
