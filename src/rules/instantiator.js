import {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
} from "../parse/evaluate.js";
import { setContext, getContext } from "../parse/parseExpression.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";

const loop = (testFunc, children) => {
    bigLoop: while (testFunc()) {
        for (const child of children) {
            evaluateIndentTree(child);

            if (getContext("breakingLoop")) {
                setContext({ breakingLoop: false });
                break bigLoop;
            }
            if (getContext("continuingLoop")) {
                setContext({ continuingLoop: false });
                break;
            }
        }
    }
};

export default {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                setContext({ runBlock: () => evaluateExpression(test) });
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                setContext({
                    loop: true,
                    runBlock: () => evaluateExpression(test),
                });
            },
        },
        {
            pattern: ["repeat", OPTIONAL(type("Number")), ":"],
            evaluate: ({ tokens: [_, test], setContext }) => {
                let i = 0;
                setContext({
                    loop: true,
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
