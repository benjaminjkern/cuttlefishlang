import { CuttlefishError } from "../util/index.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import RULES from "../rules/index.js";
import GENERICS from "../rules/generics.js";

import { evaluateExpression } from "./evaluate.js";
import { newContext } from "../parse/context.js";
import { consoleWarn } from "../util/environment.js";
import { generateHeuristics } from "../parse/heuristics/generateHeuristics.js";
import { makeTypeKey } from "../parse/genericUtils.js";
import { combineRulesets, type } from "../parse/ruleUtils.js";

export const newInterpretContext = (extraRules = {}, parentContexts = {}) => {
    const context = {
        ...newContext(
            combineRulesets(RULES, extraRules),
            GENERICS,
            parentContexts
        ),
        vars: [],
        setVariable: (varName, typeToken, value) => {
            const typeKey = makeTypeKey(typeToken);
            if (
                context.vars[varName]?.typeKey &&
                context.vars[varName].typeKey !== typeKey
            ) {
                consoleWarn(
                    `Warning: Changing type of variable ${varName} (${context.vars[varName].typeKey} -> ${typeKey})`
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
                context.rules[typeToken.type].push({
                    allowedSubtypes: typeToken.subtypes,
                    pattern: [varName],
                    evaluate: () => context.vars[varName].value,
                });
                console.log(
                    "UGH1",
                    context.heuristics.minLength.typeKeyValues.printable
                );
                context.heuristics = generateHeuristics(
                    context.rules,
                    context.generics,
                    context.parentContexts
                    // No subcontexts, this should be done from scratch
                );

                console.log(
                    "UGH2",
                    context.heuristics.minLength.typeKeyValues.printable
                );
            }
            context.vars[varName] = { value, typeKey };
        },
    };
    context.evaluateExpression = evaluateExpression(context);
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
                    type("Instantiator"),
                    instantiatorStatement.line,
                    lineNumber,
                    context
                );
            if (parse.error)
                throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
            treeNode.parsedNode = parse;
            context.evaluateExpression(
                { ...parse, unparsedStatements: statements, lineNumber },
                interpretIndentTree
            );
            return;
        }
        interpretStatementList(statements, context);
        return;
    }
    const parse =
        parsedNode ||
        parseExpressionAsType(type("Statement"), line, lineNumber, context);
    if (parse.error)
        throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
    treeNode.parsedNode = parse;
    context.evaluateExpression({ ...parse, lineNumber });
};

const interpretStatementList = (statementList, context) => {
    for (const statement of statementList) {
        if (context.breakingLoop || context.continuingLoop) break;
        interpretIndentTree(statement, context);
    }
};
