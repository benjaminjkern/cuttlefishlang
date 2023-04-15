import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OR, MULTI, ANYCHAR, OPTIONAL } from "../parse/ruleUtils.js";
import { consoleWrite } from "../util/environment.js";
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
            pattern: ["print", OR(type("Iterable"), type("stringlike"))],
            evaluate: ({ tokens: [_, iter] }) => {
                print(evaluateExpression(iter));
                consoleWrite("\n");
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
        {
            pattern: ["if", type("Boolean"), ":", OPTIONAL(type("Statement"))],
            evaluate: ({
                tokens: [_1, test, _2, statement],
                setContext,
                context,
            }) => {
                const shouldRun = evaluateExpression(test);
                if (shouldRun) evaluateExpression(statement, context);
                setContext({ ranIfStatement: shouldRun });
            },
        },
        {
            pattern: ["else", OPTIONAL(":"), type("Statement")], // I personally like this colon being optional
            evaluate: ({
                getContext,
                tokens: [_1, _2, statement],
                context,
            }) => {
                const ranIfStatement = getContext("ranIfStatement");
                if (ranIfStatement === undefined)
                    throw CuttlefishError(
                        "`else` statement must follow an `if` statement!",
                        undefined,
                        "Semantics Error"
                    );
                if (getContext("ranIfStatement")) return;
                evaluateExpression(statement, context);
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz"), 1)],
        },
    ],
};

const print = (object) => {
    if (!Array.isArray(object)) return consoleWrite(forceString(object));

    const iterator = makeIterator(object);
    consoleWrite("[ ");
    while (iterator.hasNext()) {
        const next = iterator.next();
        print(next);
        if (iterator.hasNext()) consoleWrite(", ");
    }
    consoleWrite(" ]");
};
