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
                context[key] = newContext[key];
            }
        },
    });
};
