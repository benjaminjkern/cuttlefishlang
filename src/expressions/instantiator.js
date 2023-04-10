import {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
} from "../parse/evaluate.js";
import { setContext, getContext } from "../parse/parseExpression.js";
import { type, OPTIONAL } from "../parse/ruleUtils.js";
import { newRuleList } from "./index.js";

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

newRuleList("Instantiator", [
    {
        pattern: ["if", type("Boolean"), ":"],
        evaluate: ({ tokens: [_, test], children }) => {
            if (evaluateExpression(test)) evaluateStatementList(children);
        },
    },
    {
        pattern: ["while", type("Boolean"), ":"],
        evaluate: ({ tokens: [_, test], children }) => {
            loop(() => evaluateExpression(test), children);
        },
    },
    {
        pattern: ["repeat", OPTIONAL(type("Number")), ":"],
        evaluate: ({ tokens: [_, test], children }) => {
            let i = 0;

            loop(() => {
                i++;
                if (test.length) return i < evaluateExpression(test);
                return true;
            }, children);
        },
    },
    {
        pattern: ["for", type("Iterable"), ":"],
        evaluate: ({ tokens: [_, iterable], children }) => {
            for (const item of evaluateExpression(iterable)) {
                evaluateStatementList(children);
            }
        },
    },
]);
