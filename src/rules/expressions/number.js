import {
    MULTI,
    OPTIONAL,
    OR,
    genericType,
    type,
} from "../../parse/ruleUtils.js";

// export const numberGenerics = ["Integer"];
export default {
    Number: [
        { pattern: [type("Integer")] },
        {
            // TODO: Encode the idea that Number + Number -> Number | Integer, but Integer + Integer -> Integer
            pattern: [type("Number"), "+", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) => {
                return (
                    context.evaluateExpression(a) +
                    context.evaluateExpression(b)
                );
            },
        },
        {
            pattern: [type("Number"), "-", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) - context.evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "*", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) * context.evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "/", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) / context.evaluateExpression(b),
        },
        {
            pattern: [type("Number"), "^", type("Number")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) ** context.evaluateExpression(b),
        },
        {
            pattern: ["-", type("Number")],
            evaluate: ({ tokens: [_, a], context }) =>
                -context.evaluateExpression(a),
        },
        {
            pattern: [type("numlit")],
            evaluate: ({ sourceString }) => +sourceString,
        },
        {
            pattern: ["rand", type("Tuple")],
            evaluate: () => Math.random(),
        },
    ],
    Integer: [
        // Should somehow include all the same math rules here
        {
            pattern: ["round", type("Number")],
            evaluate: ({ tokens: [_, num], context }) =>
                Math.round(context.evaluateExpression(num)),
        },
        {
            pattern: [type("Iterable"), ".", "length"],
            evaluate: ({ tokens: [iterable], context }) => {
                return context.evaluateExpression(iterable).length;
            },
        },

        // NOTE: ALL OF THESE ARE REPEATS OF NUMBER RULES BUT IT WAS EASIER TO DO IT THIS WAY FOR THE TIME BEING
        {
            pattern: [type("Integer"), "+", type("Integer")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) + context.evaluateExpression(b),
        },
        {
            pattern: [type("Integer"), "-", type("Integer")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) - context.evaluateExpression(b),
        },
        {
            pattern: [type("Integer"), "*", type("Integer")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) * context.evaluateExpression(b),
        },
        {
            pattern: [type("Integer"), "/", type("Integer")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) / context.evaluateExpression(b),
        },
        {
            pattern: [type("Integer"), "^", type("Integer")],
            associativityReverseSearchOrder: true,
            evaluate: ({ tokens: [a, _, b], context }) =>
                context.evaluateExpression(a) ** context.evaluateExpression(b),
        },
        {
            pattern: ["-", type("Integer")],
            evaluate: ({ tokens: [_, a], context }) =>
                -context.evaluateExpression(a),
        },

        {
            pattern: [MULTI(type("digit"), 1)],
            spaces: "none",
            evaluate: ({ sourceString }) => +sourceString,
        },
    ],
    numlit: [
        {
            pattern: [
                MULTI(type("digit"), 1),
                OPTIONAL(".", OPTIONAL(type("endbit"))),
            ],
            spaces: "none",
        },
        {
            pattern: [
                MULTI(type("digit")),
                ".",
                MULTI(type("digit"), 1),
                OPTIONAL(type("endbit")),
            ],
            spaces: "none",
        },
    ],
    endbit: [{ pattern: [OR("e", "E"), MULTI(type("digit"), 1)] }],
};
