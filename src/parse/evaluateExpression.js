const evaluateExpression = (parsedNode) => {
    if (!parsedNode.evaluate) {
        if (parsedNode.length) return evaluateExpression(parsedNode[0]);
        console.warn(parsedNode);
    }
    return parsedNode.evaluate({
        tokens: parsedNode.children,
        sourceString: parsedNode.sourceString,
    });
};

module.exports = evaluateExpression;
