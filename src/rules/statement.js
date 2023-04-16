import { evaluateExpression } from "../evaluate/evaluate.js";
import { type, OR, MULTI, ANYCHAR, OPTIONAL } from "../parse/ruleUtils.js";
import { consoleWrite } from "../util/environment.js";
import { CuttlefishError } from "../util/index.js";
import { forceString } from "./expressions/string.js";

export default {
    Statement: [
        {
            pattern: ["print", OR(type("Iterable"), type("stringlike"))],
            evaluate: ({ tokens: [_, toPrint] }) => {
                print(evaluateExpression(toPrint));
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
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz_", true), 1)],
        },
    ],
};

export const print = (object) => {
    if (!object.hasNext) return consoleWrite(forceString(object));
    // Assume object is an iterator
    object.restart();

    // If it has at least one item, then it should have padding (Looks nice)
    const listPadding = object.hasNext() ? " " : "";

    consoleWrite(`[${listPadding}`);
    while (object.hasNext()) {
        print(object.next());
        if (object.hasNext()) consoleWrite(", ");
    }
    consoleWrite(`${listPadding}]`);
};
