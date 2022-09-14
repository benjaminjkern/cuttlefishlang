const CONTEXT = {};

const evaluateIndentTree = (parsedNode) => {
    const { instantiator, children } = parsedNode;
    if (children) {
        if (parsedNode.instantiator)
            return parsedNode.instantiator.evaluate({
                tokens: instantiator.tokens,
                sourceString: instantiator.sourceString,
                children,
            });
        return evaluateStatementList(children);
    }
    return evaluateExpression(parsedNode);
};

const evaluateStatementList = (expList) => {
    const context = {};
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
    });
};

module.exports = {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
};
