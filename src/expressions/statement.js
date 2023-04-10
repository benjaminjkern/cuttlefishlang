import { evaluateExpression } from "../parse/evaluate.js";
import {
    newParseVariable,
    setVariable,
    setContext,
    getContext,
} from "../parse/parseExpression.js";
import { type, OR, MULTI, ANYCHAR } from "../parse/ruleUtils.js";
import { CuttlefishError } from "../util/index.js";
import { newRuleList } from "./index.js";

newRuleList("Statement", [
    {
        pattern: ["print", OR(type("String"), type("Number"), type("Boolean"))],
        evaluate: ({ tokens: [_, string] }) => {
            const stringValue = evaluateExpression(string);
            console.log(stringValue); // eslint-disable-line no-console
        },
    },
    {
        pattern: ["print", type("Iterable")],
        evaluate: ({ tokens: [_, iter] }) => {
            const iterator = evaluateIterator(iter);
            while (iterator.hasNext()) {
                const i = iterator.next();
                process.stdout.write(i);
                if (iterator.hasNext()) process.stdout.write(", ");
            }
            process.stdout("\n");
        },
    },
    {
        pattern: [type("varName"), "=", type("Object")],
        evaluate: ({ tokens: [id, _, obj] }) => {
            setVariable(id.sourceString, evaluateExpression(obj));
        },
    },
    {
        pattern: ["break"],
        evaluate: () => {
            const inLoop = getContext("inLoop");
            if (!inLoop || !inLoop.length)
                throw CuttlefishError(
                    lineNumber,
                    `Cannot use break outside of loop!`
                );
            setContext({ breakingLoop: true });
        },
    },
    {
        pattern: ["continue"],
        evaluate: () => {
            const inLoop = getContext("inLoop");
            if (inLoop === undefined)
                throw CuttlefishError(
                    lineNumber,
                    `Cannot use continue outside of loop!`
                );
            setContext({ continuingLoop: true });
        },
    },
]);

newRuleList("varName", [
    {
        pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
    },
]);
