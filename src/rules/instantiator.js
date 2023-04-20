import { newInterpretContext } from "../evaluate/interpret.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";
import { CuttlefishError } from "../util/index.js";

const loop = (testFunc, context, childIterator) => {
    const oldInLoop = context.inLoop;
    context.inLoop = true;
    while (testFunc()) {
        context.continuingLoop = false;
        context.breakingLoop = false;
        childIterator.restart();
        while (childIterator.hasNext()) {
            childIterator.next();
            if (context.continuingLoop || context.breakingLoop) break;
        }
        if (context.breakingLoop) break;
    }
    context.inLoop = oldInLoop;
};

export default {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"], // None of these colons need to be here since the parser can handle it but I like them
            evaluate: ({ tokens: [_, test], childIterator, context }) => {
                const shouldRun = context.evaluateExpression(test);
                if (shouldRun) childIterator.iterateToEnd();
                context.ranIfStatement = shouldRun;
            },
        },
        {
            pattern: ["else", ":"],
            evaluate: ({ context, childIterator }) => {
                const ranIfStatement = context.ranIfStatement;
                if (ranIfStatement === undefined)
                    throw CuttlefishError(
                        "`else` statement must follow an `if` statement!",
                        undefined,
                        "Semantics Error"
                    );
                if (ranIfStatement) return;
                childIterator.iterateToEnd();
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], childIterator, context }) => {
                loop(
                    () => context.evaluateExpression(test),
                    context,
                    childIterator
                );
            },
        },
        {
            pattern: ["repeat", OPTIONAL(type("Integer")), ":"], // NOTE: I am casting to integer here but maybe it should allow non-integers
            evaluate: ({
                tokens: [_, repeatCount],
                context,
                childIterator,
            }) => {
                let i = 0;
                loop(
                    () => {
                        i++;
                        // If no number is input, just repeat indefinitely
                        if (repeatCount.length)
                            return i < context.evaluateExpression(repeatCount);
                        return true;
                    },
                    context,
                    childIterator
                );
            },
        },
        {
            pattern: ["for", type("Iterable"), OPTIONAL(":")],
            evaluate: ({ tokens: [_, iterable], context, childIterator }) => {
                const iterator = context.evaluateExpression(iterable).clone();
                loop(
                    () => {
                        if (!iterator.hasNext()) return false;
                        const value = iterator.next();
                        context.setVariable(
                            "$",
                            getTypeFromValue(value),
                            value
                        );
                        return true;
                    },
                    context,
                    childIterator
                );
            },
        },

        {
            pattern: [type("varName"), "=", "fn", ":"],
            evaluate: ({ tokens: [id], context, childIterator }) => {
                context.setVariable(id.sourceString, "Function", {
                    asString: "(Function)",
                    call: (input) => {
                        const insideContext = newInterpretContext();
                        insideContext.setVariable(
                            "$",
                            getTypeFromValue(input),
                            input
                        );
                        insideContext.inFunction = true;
                        childIterator.restart();
                        childIterator.iterateToEnd();
                    },
                });
            },
        },
    ],
};

export const getTypeFromValue = (value) => {
    if (typeof value === "number") return "Number";
    if (typeof value === "string") return "String";
    if (typeof value === "boolean") return "Boolean";
    if (Array.isArray(value)) return "Iterable";
    return "Object";
};
