import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OR, MULTI, ANYCHAR } from "../parse/ruleUtils.js";
import { CuttlefishError } from "../util/index.js";

export default {
    Statement: [
        {
            pattern: [
                "print",
                OR(type("String"), type("Number"), type("Boolean")),
            ],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = evaluateExpression(string);
                console.log(stringValue); // eslint-disable-line no-console
            },
        },
        {
            pattern: ["print", type("Iterable")],
            evaluate: ({ tokens: [_, iter] }) => {
                throw "Cannot print iterables yet!";
                // const iterator = evaluateIterator(iter);
                // while (iterator.hasNext()) {
                //     const i = iterator.next();
                //     process.stdout.write(i);
                //     if (iterator.hasNext()) process.stdout.write(", ");
                // }
                // process.stdout("\n");
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
