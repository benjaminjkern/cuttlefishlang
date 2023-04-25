import { newInterpretContext } from "../../evaluate/interpret.js";
import {
    OR,
    genericType,
    subcontext,
    thisSubtype,
    type,
} from "../../parse/ruleUtils.js";
import { getTypeFromValue } from "../instantiator.js";

const functionDefaultSubtypes = ["Number", "Number"];

export default {
    Function: [
        {
            pattern: [
                "fn",
                ":",
                subcontext(
                    [type("Number")],
                    // [OR(type("Object"), type("Statement"))],
                    (subcontextToken) => {
                        return newInterpretContext(
                            {
                                Number: [
                                    {
                                        pattern: ["$"],
                                        evaluate: ({ context }) =>
                                            context.vars.$.value,
                                    },
                                ],
                            },
                            { [subcontextToken]: true }
                        );
                    }
                ),
            ],
            allowedSubtypes: ["Number", "Number"],
            evaluate: ({ tokens: [_1, _2, inside] }) => {
                return {
                    asString: makeStringFromFuncInside(inside),
                    call: (input) => {
                        const context = newInterpretContext();
                        context.setVariable(
                            "$",
                            type(getTypeFromValue(input)),
                            input
                        );
                        return context.evaluateExpression(inside);
                    },
                };
            },
            returnType: () => type("Function", type("Number"), type("Number")),
        },
        {
            pattern: [
                type("Function", thisSubtype(0), genericType("B")),
                "*",
                type("Function", genericType("B"), thisSubtype(1)),
            ],
            genericTypes: {
                B: "Object",
            },
            evaluate: ({ tokens: [f1, _, f2], context }) => {
                const func1 = context.evaluateExpression(f1);
                const func2 = context.evaluateExpression(f2);
                return {
                    asString: "(Composed Function)",
                    call: (input) => {
                        return func2.call(func1.call(input));
                    },
                };
            },
        },
        {
            pattern: [
                type("Function", thisSubtype(0), thisSubtype(0)),
                "^",
                type("Integer"),
            ],
            allowedSubtypes: ([a, b]) => a.type === b.type,
            evaluate: ({ tokens: [f1, _, n], context }) => {
                const func = context.evaluateExpression(f1);
                let num = context.evaluateExpression(n);
                return {
                    asString: "(Composed Function)",
                    call: (input) => {
                        let result = input;
                        while (num > 0) {
                            result = func.call(result);
                            num--;
                        }
                        return result;
                    },
                };
            },
        },
    ],
};

const makeStringFromFuncInside = (inside) => {
    return "(Function)"; // Todo: Implement
};
