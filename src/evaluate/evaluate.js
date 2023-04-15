import generateHeuristics from "../parse/heuristics.js";
import { consoleWarn } from "../util/environment.js";
import { interpretIndentTree } from "./interpret.js";

// UNUSED FOR NOW
export const evaluateParsedNode = (parsedNode, context) => {
    const { instantiator, children, lineNumber } = parsedNode;

    if (!children) return evaluateExpression(parsedNode);

    if (!instantiator) return evaluateStatementList(children);

    return instantiator.evaluate({
        tokens: instantiator.tokens,
        sourceString: instantiator.sourceString,
        children,
        lineNumber,
    });
};

export const evaluateStatementList = (expList, context) => {
    expList.forEach(evaluateParsedNode);
};

export const evaluateExpression = (parsedNode, context) => {
    if (!parsedNode.evaluate) {
        // Catch list expressions
        if (parsedNode.length)
            return evaluateExpression(parsedNode[0], context);

        throw "not sure what happened";
    }
    if (["Statement", "Instantiator"].includes(parsedNode.type)) {
        const ranIfStatement = context["ranIfStatement"];
        switch (ranIfStatement) {
            case true:
                context["ranIfStatement"] = 1;
                break;
            case false:
                context["ranIfStatement"] = 0;
                break;
            default:
                context["ranIfStatement"] = undefined;
        }
    }

    let index = 0;

    const childIterator = parsedNode.unparsedStatements && {
        hasNext: () => parsedNode.unparsedStatements[index],
        next: () => {
            index++;
            interpretIndentTree(
                parsedNode.unparsedStatements[index - 1],
                context
            );
        },
        iterateToEnd: () => {
            while (childIterator.hasNext()) childIterator.next();
        },
        restart: () => (index = 0),
    };

    return parsedNode.evaluate({
        tokens: parsedNode.tokens,
        sourceString: parsedNode.sourceString,
        lineNumber: parsedNode.lineNumber,
        childIterator,
        context,
        setContext: (newContext) => {
            for (const key in newContext) {
                context[key] = newContext[key];
            }
        },
        getContext: (key) => {
            return context[key];
        },
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
    });
};
