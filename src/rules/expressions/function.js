import { newInterpretContext } from "../../evaluate/interpret.js";
import { subcontext, type } from "../../parse/ruleUtils.js";
import { getTypeFromValue } from "../instantiator.js";

export default {
    Function: [
        {
            pattern: [
                "fn",
                ":",
                subcontext([type("Object")], (subcontextToken) => {
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
                }),
            ],
            evaluate: ({ tokens: [_1, _2, arg] }) => ({
                call: (input) => {
                    const context = newInterpretContext();
                    context.setVariable("$", getTypeFromValue(input), input);
                    return context.evaluateExpression(arg);
                },
            }),
        },
    ],
};
