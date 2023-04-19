export const evaluateExpression = (
    parsedNode,
    context,
    interpretUnparsedStatement
) => {
    if (!parsedNode.evaluate) {
        // Catch list expressions
        if (parsedNode.length)
            return evaluateExpression(parsedNode[0], context);

        throw "not sure what happened";
    }

    // Specific code for if statements
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

    // Provide an iterator for instantiators
    let index = 0;
    const childIterator = parsedNode.unparsedStatements && {
        hasNext: () => parsedNode.unparsedStatements[index],
        next: () => {
            index++;
            interpretUnparsedStatement(
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
    });
};
