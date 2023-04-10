import generateHeuristics from "../parse/heuristics.js";

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
        if (parsedNode.length) return evaluateExpression(parsedNode[0]);
        throw "not sure what happened";
    }
    return parsedNode.evaluate({
        tokens: parsedNode.tokens,
        sourceString: parsedNode.sourceString,
        lineNumber: parsedNode.lineNumber,
        setContext: (newContext) => {
            for (const key in newContext) {
                if (key === "inLoop") {
                    if (newContext.inLoop) context.loopLevel = 0;
                    else if (context.loopLevel !== undefined) {
                        context.loopLevel += 1;
                    }
                } else context[key] = newContext[key];
            }
        },
        getContext: (key) => {
            if (key === "inLoop") return context.loopLevel >= 0;
            return context[key];
        },
        setVariable: (varName, type, value) => {
            if (
                context.vars[varName]?.type &&
                context.vars[varName].type !== type
            ) {
                console.warn(
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
                context.heuristics = generateHeuristics(context.rules);
            }

            context.vars[varName] = { value, type };
        },
    });
};
