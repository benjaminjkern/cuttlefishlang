import { type, OR, MULTI, ANYCHAR, OPTIONAL } from "../parse/ruleUtils.js";
import { consoleWrite } from "../util/environment.js";
import { CuttlefishError } from "../util/index.js";
import { forceString } from "./expressions/string.js";

export default {
    Statement: [
        {
            pattern: ["print", type("printable")],
            evaluate: ({ tokens: [_, toPrint], context }) => {
                print(context.evaluateExpression(toPrint));
                consoleWrite("\n");
            },
        },
        {
            pattern: [type("varName"), "=", type("Object")],
            evaluate: ({ tokens: [id, _, obj], context }) => {
                const evaluated = context.evaluateExpression(obj);
                context.setVariable(
                    id.sourceString,
                    obj.tokens[0][0].type,
                    evaluated
                );
            },
        },
        {
            pattern: ["break"],
            evaluate: ({ lineNumber, context }) => {
                const inLoop = context.inLoop;
                if (!inLoop)
                    throw CuttlefishError(
                        `Cannot use break outside of loop!`,
                        lineNumber,
                        "Runtime Exception"
                    );
                context.breakingLoop = true;
            },
        },
        {
            pattern: ["continue"],
            evaluate: ({ lineNumber, context }) => {
                const inLoop = context.inLoop;
                if (!inLoop)
                    throw CuttlefishError(
                        `Cannot use continue outside of loop!`,
                        lineNumber,
                        "Runtime Exception"
                    );
                context.breakingLoop = true;
            },
        },
        {
            pattern: ["if", type("Boolean"), ":", OPTIONAL(type("Statement"))],
            evaluate: ({ tokens: [_1, test, _2, statement], context }) => {
                const shouldRun = context.evaluateExpression(test);
                if (shouldRun) context.evaluateExpression(statement, context);
                context.ranIfStatement = shouldRun;
            },
        },
        {
            pattern: ["else", OPTIONAL(":"), type("Statement")], // I personally like this colon being optional
            evaluate: ({ tokens: [_1, _2, statement], context }) => {
                const ranIfStatement = context.ranIfStatement;
                if (ranIfStatement === undefined)
                    throw CuttlefishError(
                        "`else` statement must follow an `if` statement!",
                        undefined,
                        "Semantics Error"
                    );
                if (ranIfStatement) return;
                context.evaluateExpression(statement, context);
            },
        },
    ],
    varName: [
        {
            pattern: [MULTI(ANYCHAR("abcdefghijklmnopqrstuvwxyz_", true), 1)],
        },
    ],
    printable: [
        {
            pattern: [
                OR(
                    type("Function"),
                    type("Iterable", type("printable")),
                    type("stringlike")
                ),
            ],
        },
    ],
};

export const print = (object) => {
    if (object.hasNext) {
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
        return;
    }

    if (object.call) {
        consoleWrite(object.asString);
        return;
    }
    return consoleWrite(forceString(object));
};
