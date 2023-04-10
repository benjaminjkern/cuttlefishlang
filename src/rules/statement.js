import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OR, MULTI, ANYCHAR } from "../parse/ruleUtils.js";
import { CuttlefishError } from "../util/index.js";
import { forceString } from "./expressions/string.js";

export const makeIterator = (iterable) => {
    if (Array.isArray(iterable)) {
        const iterator = {
            index: 0,
            next: () => {
                if (!iterator.hasNext())
                    throw "Tried calling iterator.next() when it do not have a next!";
                iterator.index++;
                return iterable[iterator.index - 1];
            },
            hasNext: () => {
                return iterator.index < iterable.length;
            },
        };
        return iterator;
    }
    throw "Not implemented yet: Non-array iterables";
};

export default {
    Statement: [
        {
            pattern: ["print", type("Iterable")],
            evaluate: ({ tokens: [_, iter] }) => {
                const iterator = makeIterator(evaluateExpression(iter));
                process.stdout.write("[ ");
                while (iterator.hasNext()) {
                    const i = iterator.next();
                    process.stdout.write(forceString(i));
                    if (iterator.hasNext()) process.stdout.write(", ");
                }
                process.stdout.write(" ]\n");
            },
        },
        {
            pattern: ["print", type("stringlike")],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue); // eslint-disable-line no-console
            },
        },
        {
            pattern: [type("varName"), "=", type("Object")],
            evaluate: ({ tokens: [id, _, obj], setVariable }) => {
                setVariable(
                    id.sourceString,
                    obj.tokens[0][0].type,
                    evaluateExpression(obj)
                );
            },
        },
        {
            pattern: ["break"],
            evaluate: ({ lineNumber, setContext, getContext }) => {
                const inLoop = getContext("inLoop");
                if (!inLoop)
                    throw CuttlefishError(
                        `Cannot use break outside of loop!`,
                        lineNumber,
                        "Runtime Exception"
                    );
                setContext({ breakingLoop: true });
            },
        },
        {
            pattern: ["continue"],
            evaluate: ({ lineNumber, setContext, getContext }) => {
                const inLoop = getContext("inLoop");
                if (!inLoop)
                    throw CuttlefishError(
                        `Cannot use continue outside of loop!`,
                        lineNumber,
                        "Runtime Exception"
                    );
                setContext({ continuingLoop: true });
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
        },
    ],
};
