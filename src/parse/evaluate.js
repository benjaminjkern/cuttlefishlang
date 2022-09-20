const evaluateIndentTree = (parsedNode) => {
    const { instantiator, children, lineNumber } = parsedNode;
    if (children) {
        if (parsedNode.instantiator) {
            const evaluation = parsedNode.instantiator.evaluate({
                tokens: instantiator.tokens,
                sourceString: instantiator.sourceString,
                children,
                lineNumber,
            });
            if (parsedNode.instantiator.onExitScope) {
                parsedNode.instantiator.onExitScope({
                    tokens: instantiator.tokens,
                    sourceString: instantiator.sourceString,
                    children,
                    lineNumber,
                });
            }
            return evaluation;
        }
        return evaluateStatementList(children);
    }
    return evaluateExpression(parsedNode);
};

const evaluateStatementList = (expList) => {
    expList.forEach(evaluateIndentTree);
};

const evaluateExpression = (parsedNode) => {
    if (!parsedNode.evaluate) {
        if (parsedNode.length) return evaluateExpression(parsedNode[0]);
        console.warn("not sure what happened", parsedNode);
    }
    return parsedNode.evaluate({
        tokens: parsedNode.tokens,
        sourceString: parsedNode.sourceString,
        lineNumber: parsedNode.lineNumber,
    });
};

module.exports = {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
};
