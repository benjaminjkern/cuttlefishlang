import { evaluateExpression } from "../../evaluate/evaluate.js";
import { newInterpretContext } from "../../evaluate/interpret.js";
import { type } from "../../parse/ruleUtils.js";
import { getTypeFromValue } from "../instantiator.js";

export default {
    Function: [
        {
            pattern: ["fn", ":", type("Object")],
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
