import { evaluateExpression } from "../../evaluate/evaluate.js";
import { newInterpretContext } from "../../evaluate/interpret.js";
import { subcontext, type } from "../../parse/ruleUtils.js";
import { getTypeFromValue } from "../instantiator.js";

export default {
    Function: [
        {
            pattern: [
                "fn",
                ":",
                subcontext(
                    [type("Object")],
                    {
                        Number: [
                            {
                                pattern: ["$"],
                                evaluate: ({ context }) => context.vars.$.value,
                            },
                        ],
                    },
                    () => newInterpretContext()
                ),
            ],
            evaluate: ({ tokens: [_1, _2, arg] }) => ({
                call: (input) => {
                    const context = newInterpretContext();
                    context.setVariable("$", getTypeFromValue(input), input);
                    return evaluateExpression(arg, context);
                },
            }),
        },
    ],
};
