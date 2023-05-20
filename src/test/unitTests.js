import { newInterpretContext } from "../evaluate/interpret.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import { type } from "../parse/ruleUtils.js";
import { environment } from "../util/environment.js";
import { evaluateToCompletion, inspect } from "../util/index.js";

environment.debug = true;

const context = newInterpretContext();

// console.log(
//     evaluateToCompletion(
//         context.heuristics.minLength.values.fromPattern([
//             type("Iterable"),
//             "++",
//             type("Iterable"),
//         ])
//     )
// );

console.log(
    evaluateToCompletion(
        context.heuristics.allowedCharacters.values.fromTypeToken(type("List"))
    )
);

// inspect(context.heuristics.minLength.typeValues);

// parseExpressionAsType(
//     type("Object"),
//     "[1..5] ++ [5..10]",
//     0,
//     newInterpretContext()
// );
