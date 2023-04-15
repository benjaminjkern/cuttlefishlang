import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type } from "../../parse/ruleUtils.js";
import { consoleWarn } from "../../util/environment.js";

export default {
    Boolean: [
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
        {
            // Value comparison
            pattern: [type("Object"), "==", type("Object")],
            evaluate: ({ tokens: [a, _, b] }) =>
                evaluateExpression(a) === evaluateExpression(b),
        },
        {
            pattern: [type("Object"), "in", type("Iterable")],
            evaluate: ({ tokens: [obj, _, iter] }) => {
                const iterator = evaluateExpression(iter).clone();
                const object = evaluateExpression(obj);
                if (iterator.itemInIterator)
                    return iterator.itemInIterator(object);

                consoleWarn(
                    "Warning: Iterator `in` operation running in iteration mode!"
                );

                while (iterator.hasNext()) {
                    if (iterator.next() === object) return true;
                }
                return false;
            },
        },

        // {
        //     // Pointer comparison
        //     pattern: [type("Object"), "===", type("Object")],
        //     evaluate: ({ tokens: [a, _, b] }) =>
        //         evaluateExpression(a) === evaluateExpression(b),
        // },
        { pattern: [type("boollit")] },
    ],
    boollit: [
        {
            pattern: ["true"],
            evaluate: () => true,
        },
        {
            pattern: ["false"],
            evaluate: () => false,
        },
    ],
};
