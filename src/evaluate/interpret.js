import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import RULES from "../rules/index.js";
import GENERICS from "../rules/generics.js";

import { evaluateExpression } from "./evaluate.js";
import { newContext } from "../parse/context.js";
import { consoleWarn } from "../util/environment.js";
import generateHeuristics from "../parse/heuristics.js";

export const newInterpretContext = () => {
    const context = {
        ...newContext(RULES, GENERICS),
        vars: [],
        setVariable: (varName, type, value) => {
            if (
                context.vars[varName]?.type &&
                context.vars[varName].type !== type
            ) {
                consoleWarn(
                    `Warning: Changing type of variable ${varName} (${context.vars[varName].type} -> ${type})`
                );
                context.rules[context.vars[varName].type] = context.rules[
                    context.vars[varName].type
                ].filter(
                    ({ pattern }) =>
                        pattern.length !== 1 && pattern[0] !== varName
                );
                delete context.vars[varName];
            }

            if (context.vars[varName] === undefined) {
                context.rules[type].push({
                    pattern: [varName],
                    evaluate: () => context.vars[varName].value,
                });
                context.heuristics = generateHeuristics(
                    context.rules,
                    context.generics
                );
            }
            context.vars[varName] = { value, type };
        },
    };
    return context;
};

/**
 * Parse AND evaluate
 */
export const interpretIndentTree = (
    treeNode,
    context = newInterpretContext()
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
                context,
                interpretIndentTree
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
