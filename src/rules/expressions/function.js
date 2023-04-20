import { newInterpretContext } from "../../evaluate/interpret.js";
import { OR, subcontext, type } from "../../parse/ruleUtils.js";
import { getTypeFromValue } from "../instantiator.js";

export default {
    Function: [
        {
            pattern: [
                "fn",
                ":",
                subcontext(
                    [OR(type("Object"), type("Statement"))],
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
            evaluate: ({ tokens: [_1, _2, inside] }) => {
                return {
                    asString: makeStringFromFuncInside(inside),
                    call: (input) => {
                        const context = newInterpretContext();
                        context.setVariable(
                            "$",
                            getTypeFromValue(input),
                            input
                        );
                        return context.evaluateExpression(inside);
                    },
                };
            },
        },
        {
            pattern: [type("Function"), "*", type("Function")],
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
            pattern: [type("Function"), "^", type("Integer")],
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
