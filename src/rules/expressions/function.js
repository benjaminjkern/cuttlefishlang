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
    ],
};

const makeStringFromFuncInside = (inside) => {
    return "(Function)"; // Todo: Implement
};
