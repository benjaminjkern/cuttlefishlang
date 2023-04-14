import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import RULES from "../rules/index.js";
import GENERICS from "../rules/generics.js";

import { evaluateExpression } from "./evaluate.js";
import { newContext } from "../parse/context.js";

/**
 * Parse AND evaluate
 */
export const interpretIndentTree = (
    treeNode,
    context = { ...newContext(RULES, GENERICS), vars: [] }
) => {
    const { instantiatorStatement, statements, lineNumber, line, parsedNode } =
        treeNode;
    if (statements) {
        if (instantiatorStatement) {
            const parse =
                parsedNode ||
                parseExpressionAsType(
                    "Instantiator",
                    instantiatorStatement.line,
                    lineNumber,
                    context
                );
            if (parse.error)
                throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
            treeNode.parsedNode = parse;
            evaluateExpression(
                { ...parse, unparsedStatements: statements, lineNumber },
                context
            );
            return;
        }
        interpretStatementList(statements, context);
        return;
    }
    const parse =
        parsedNode ||
        parseExpressionAsType("Statement", line, lineNumber, context);
    if (parse.error)
        throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
    treeNode.parsedNode = parse;
    evaluateExpression({ ...parse, lineNumber }, context);
};

const interpretStatementList = (statementList, context) => {
    for (const statement of statementList) {
        if (context.breakingLoop || context.continuingLoop) break;
        interpretIndentTree(statement, context);
    }
};
