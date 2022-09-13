const evaluateExpression = (parsedNode) => {
    return parsedNode.evaluate({
        tokens: parsedNode.children,
        sourceString: parsedNode.sourceString,
    });
};

module.exports = evaluateExpression;
