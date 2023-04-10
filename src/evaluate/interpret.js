import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "./parseExpression.js";

import RULES from "../expressions/index.js";
import {
    evaluateExpression,
    evaluateIndentTree,
    evaluateInstantiator,
    evaluateStatement,
} from "./evaluate.js";

/**
 * Parse AND evaluate
 */
export const interpretIndentTree = (
    { instantiatorStatement, statements, lineNumber, line },
    rules = deepCopy(RULES),
    context = {}
) => {
    if (statements) {
        if (instantiatorStatement) {
            const parsedTree = { lineNumber };
            parsedTree.instantiator = parseExpressionAsType(
                "Instantiator",
                instantiatorStatement.line,
                lineNumber
            );
            if (parsedTree.instantiator.error)
                throw CuttlefishError(
                    instantiatorStatement.lineNumber,
                    parsedTree.instantiator.error
                );
            evaluateInstantiator(parsedTree, context);
        }
        for (const statementNode of statements) {
            interpretIndentTree(statementNode, rules, context);
        }
    }
    const parse = parseExpressionAsType("Statement", line, lineNumber);
    if (parse.error) throw CuttlefishError(lineNumber, parse.error);
    evaluateStatement({ ...parse, lineNumber }, context);
};
