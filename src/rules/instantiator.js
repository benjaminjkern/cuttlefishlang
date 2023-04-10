import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";

export default {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                setContext({
                    inLoop: false,
                    runBlock: () => evaluateExpression(test),
                });
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                setContext({
                    inLoop: true,
                    runBlock: () => evaluateExpression(test),
                });
            },
        },
        {
            pattern: ["repeat", OPTIONAL(type("Number")), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                let i = 0;
                setContext({
                    inLoop: true,
                    runBlock: () => {
                        i++;
                        if (test.length) return i < evaluateExpression(test); // If no number is input, just repeat indefinitely
                        return true;
                    },
                });
            },
        },
        {
            pattern: ["for", type("Iterable"), ":"],
            evaluate: ({ tokens: [_, iterable], setContext }) => {
                throw "Cannot loop over iterables quite yet!";
                // const iterator = evaluateIterator(iterable);
                // setContext({
                //     loop: true,
                //     runBlock: () => {
                //         if (!iterator.hasNext()) return false;
                //         return true; // TODO: NOT SURE HOW TO DO THIS QUITE YET
                //     }
                // });
            },
        },
    ],
};
