const { CuttlefishError } = require("../util");
const parseExpression = require("./parseExpression");

const parseIndentTree = ({
    instantiatorStatement,
    statements,
    lineNumber,
    line,
}) => {
    if (statements) {
        const parsedTree = {};
        if (instantiatorStatement) {
            parsedTree.instantiator = parseExpression(
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
    const parse = parseExpression("Statement", line);
    if (parse.error) throw CuttlefishError(lineNumber, parse.error);
    return parse;
};

module.exports = parseIndentTree;
