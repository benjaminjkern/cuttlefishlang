import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";
import { makeIterator } from "./statement.js";

const loop = (testFunc, setContext, getContext, childIterator) => {
    const oldInLoop = getContext("inLoop");
    setContext({
        inLoop: true,
    });
    while (testFunc()) {
        setContext({
            continuingLoop: false,
            breakingLoop: false,
        });
        childIterator.restart();
        while (childIterator.hasNext()) {
            childIterator.next();
            if (getContext("continuingLoop") || getContext("breakingLoop"))
                break;
        }
        if (getContext("breakingLoop")) break;
    }
    setContext({
        inLoop: oldInLoop,
    });
};

export default {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], childIterator, setContext }) => {
                const shouldRun = evaluateExpression(test);
                if (shouldRun) childIterator.iterateToEnd();
                setContext({ ranIfStatement: shouldRun });
            },
        },
        {
            pattern: ["else", ":"],
            evaluate: ({ getContext, childIterator }) => {
                if (getContext("ranIfStatement")) return;
                childIterator.iterateToEnd();
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            evaluate: ({
                tokens: [_, test],
                setContext,
                getContext,
                childIterator,
            }) => {
                loop(
                    () => evaluateExpression(test),
                    setContext,
                    getContext,
                    childIterator
                );
            },
        },
        {
            pattern: ["repeat", OPTIONAL(type("Number")), ":"],
            evaluate: ({
                tokens: [_, repeatCount],
                setContext,
                getContext,
                childIterator,
            }) => {
                let i = 0;
                loop(
                    () => {
                        i++;
                        if (repeatCount.length)
                            return i < evaluateExpression(repeatCount); // If no number is input, just repeat indefinitely
                        return true;
                    },
                    setContext,
                    getContext,
                    childIterator
                );
            },
        },
        {
            pattern: ["for", type("Iterable"), ":"],
            evaluate: ({
                tokens: [_, iterable],
                setContext,
                setVariable,
                getContext,
                childIterator,
            }) => {
                const iterator = makeIterator(evaluateExpression(iterable));
                loop(
                    () => {
                        if (!iterator.hasNext()) return false;
                        const value = iterator.next();
                        setVariable("$", getTypeFromValue(value), value);
                        return true; // TODO: NOT SURE HOW TO DO THIS QUITE YET
                    },
                    setContext,
                    getContext,
                    childIterator
                );
            },
        },
    ],
};

const getTypeFromValue = (value) => {
    if (typeof value === "number") return "Number";
    if (typeof value === "string") return "String";
    if (typeof value === "boolean") return "Boolean";
    if (Array.isArray(value)) return "Iterable";
    return "Object";
};
