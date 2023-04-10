import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "./parseExpression.js";

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
                instantiatorStatement.line,
                lineNumber
            );
            if (parsedTree.instantiator.error)
                throw CuttlefishError(
                    instantiatorStatement.lineNumber,
                    parsedTree.instantiator.error
                );
        }
        parsedTree.children = statements.map(parseIndentTree);
        return { ...parsedTree, lineNumber };
    }
    const parse = parseExpressionAsType("Statement", line, lineNumber);
    if (parse.error) throw CuttlefishError(lineNumber, parse.error);
    return { ...parse, lineNumber };
};

export default parseIndentTree;
