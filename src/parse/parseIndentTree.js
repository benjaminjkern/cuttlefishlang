const { CuttlefishError } = require("../util");
const { parseExpressionAsType } = require("./parseExpression");

const parseIndentTree = ({
    instantiatorStatement,
    statements,
    lineNumber,
    line,
}) => {
    if (statements) {
        const parsedTree = {};
        if (instantiatorStatement) {
            parsedTree.instantiator = parseExpressionAsType(
                "Instantiator",
                instantiatorStatement.line
            );
            if (parsedTree.instantiator.error)
                throw CuttlefishError(
                    instantiatorStatement.lineNumber,
                    parsedTree.instantiator.error
                );
        }
        parsedTree.children = statements.map(parseIndentTree);
        return parsedTree;
    }
    const parse = parseExpressionAsType("Statement", line);
    if (parse.error) throw CuttlefishError(lineNumber, parse.error);
    return parse;
};

module.exports = parseIndentTree;
