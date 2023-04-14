import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";
import { CuttlefishError } from "../util/index.js";
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
            pattern: ["if", type("Boolean"), ":"], // None of these colons need to be here since the parser can handle it but I like them
            evaluate: ({ tokens: [_, test], childIterator, setContext }) => {
                const shouldRun = evaluateExpression(test);
                if (shouldRun) childIterator.iterateToEnd();
                setContext({ ranIfStatement: shouldRun });
            },
        },
        {
            pattern: ["else", ":"],
            evaluate: ({ getContext, childIterator }) => {
                const ranIfStatement = getContext("ranIfStatement");
                if (ranIfStatement === undefined)
                    throw CuttlefishError(
                        "`else` statement must follow an `if` statement!",
                        undefined,
                        "Semantics Error"
                    );
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
            pattern: ["repeat", OPTIONAL(type("Integer")), ":"], // NOTE: I am casting to integer here but maybe it should allow non-integers
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
            pattern: ["for", type("Iterable"), OPTIONAL(":")],
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
