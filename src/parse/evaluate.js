export const evaluateIndentTree = (parsedNode) => {
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

export const evaluateStatementList = (expList) => {
    expList.forEach(evaluateIndentTree);
};

export const evaluateExpression = (parsedNode, context) => {
    if (!parsedNode.evaluate) {
        // if (parsedNode.length) return evaluateExpression(parsedNode[0]);
        throw "not sure what happened";
    }
    return parsedNode.evaluate({
        tokens: parsedNode.tokens,
        sourceString: parsedNode.sourceString,
        lineNumber: parsedNode.lineNumber,
    });
};

export const evaluateInstantiator = (parsedInstantiator, context) => {
    if (!parsedInstantiator.evaluate) {
        throw "not sure what happened";
    }

    return parsedInstantiator.evaluate({
        tokens: parsedInstantiator.tokens,
        sourceString: parsedInstantiator.sourceString,
        lineNumber: parsedInstantiator.lineNumber,
        setContext: (newContext) => {
            for (const key in newContext) {
                if (key === "loop") {
                    context.loopLevel = (context.loopLevel || 0) + 1;
                } else context[key] = newContext[key];
            }
        },
    });
};
