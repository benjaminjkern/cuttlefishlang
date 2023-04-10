import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import RULES from "../rules/index.js";

import { evaluateExpression } from "./evaluate.js";
import { newContext } from "../parse/context.js";

/**
 * Parse AND evaluate
 */
export const interpretIndentTree = (
    { instantiatorStatement, statements, lineNumber, line },
    context = { ...newContext(RULES), vars: [] }
) => {
    if (statements) {
        if (instantiatorStatement) {
            const parse = parseExpressionAsType(
                "Instantiator",
                instantiatorStatement.line,
                lineNumber,
                context
            );
            if (parse.error)
                throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
            const insideContext = deepCopy(context);
            insideContext.vars = context.vars;
            evaluateExpression({ ...parse, lineNumber }, insideContext);

            while (insideContext.runBlock()) {
                insideContext.breakingLoop = false;
                insideContext.continuingLoop = false;
                interpretStatementList(statements, insideContext);
                if (
                    insideContext.loopLevel === undefined ||
                    insideContext.loopLevel > 0 ||
                    insideContext.breakingLoop
                )
                    break;
            }
            if (insideContext.loopLevel > 0) {
                // carry to outer context
                context.breakingLoop = insideContext.breakingLoop;
                context.continuingLoop = insideContext.continuingLoop;
            }
            return;
        }
        interpretStatementList(statements, context);
        return;
    }
    const parse = parseExpressionAsType("Statement", line, lineNumber, context);
    if (parse.error)
        throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
    evaluateExpression({ ...parse, lineNumber }, context);
};

const interpretStatementList = (statementList, context) => {
    for (const statement of statementList) {
        if (context.breakingLoop || context.continuingLoop) break;
        interpretIndentTree(statement, context);
    }
};
