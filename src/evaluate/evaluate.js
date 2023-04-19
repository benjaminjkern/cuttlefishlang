export const evaluateExpression =
    (context) => (parsedNode, interpretUnparsedStatement) => {
        if (!parsedNode.evaluate) {
            // Catch list expressions
            if (parsedNode.length)
                return context.evaluateExpression(parsedNode[0]);

            throw "not sure what happened";
        }

        // Specific code for if statements, this does extra code that keeps the context around for 1 extra line just in case there's an else statement
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
