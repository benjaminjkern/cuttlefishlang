import { CuttlefishError, deepCopy } from "../util/index.js";
import { parseExpressionAsType } from "../parse/parseExpression.js";
import { type } from "../parse/ruleUtils.js";

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
                type("Instantiator"),
                instantiatorStatement.line,
                lineNumber
            );
            if (parsedTree.instantiator.error)
                throw CuttlefishError(
                    parsedTree.instantiator.error,
                    instantiatorStatement.lineNumber,
                    "Parsing Error"
                );
        }
        parsedTree.children = statements.map(parseIndentTree);
        return { ...parsedTree, lineNumber };
    }
    const parse = parseExpressionAsType("Statement", line, lineNumber);
    if (parse.error)
        throw CuttlefishError(parse.error, lineNumber, "Parsing Error");
    return { ...parse, lineNumber };
};

export default parseIndentTree;
