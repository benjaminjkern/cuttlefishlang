import { newInterpretContext } from "../evaluate/interpret.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import { type } from "../parse/ruleUtils.js";
import { environment } from "../util/environment.js";
import { inspect } from "../util/index.js";

environment.debug = true;

const context = newInterpretContext();

inspect(context.heuristics.minLength.values.fromType(type("Function")));

inspect(context.heuristics.minLength.typeValues);

// parseExpressionAsType(
//     type("Object"),
//     "[1..5] ++ [5..10]",
//     0,
//     newInterpretContext()
// );
