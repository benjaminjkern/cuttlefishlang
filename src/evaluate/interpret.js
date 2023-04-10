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
            if (parse.error) throw CuttlefishError(lineNumber, parse.error);
            const insideContext = deepCopy(context);
            evaluateExpression({ ...parse, lineNumber }, insideContext);

            while (insideContext.runBlock()) {
                interpretStatementList(statements, insideContext);
                if (!insideContext.inLoop) break;
            }
            return;
        }
        interpretStatementList(statements, context);
        return;
    }
    const parse = parseExpressionAsType("Statement", line, lineNumber, context);
    if (parse.error) throw CuttlefishError(lineNumber, parse.error);
    evaluateExpression({ ...parse, lineNumber }, context);
};

const interpretStatementList = (statementList, context) => {
    for (const statement of statementList) {
        if (context.breakingLoop) {
            context.inLoop = false;
            break;
        }
        if (context.continuingLoop) {
            break;
        }
        interpretIndentTree(statement, context);
    }
};
