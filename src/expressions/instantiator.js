const {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
} = require("../parse/evaluate");
const { setContext, getContext } = require("../parse/parseExpression");
const { type, OR } = require("../parse/ruleUtils");

module.exports = {
    Instantiator: [
        {
            pattern: ["if", type("Boolean"), ":"],
            evaluate: ({ tokens: [_, test], children }) => {
                if (evaluateExpression(test)) evaluateStatementList(children);
            },
        },
        {
            pattern: ["while", type("Boolean"), ":"],
            onParse: ({ lineNumber }) => {
                setContext({
                    inLoop: [lineNumber, ...(getContext("inLoop") || [])],
                });
            },
            onExitScope: () => {
                setContext({ inLoop: getContext("inLoop").slice(1) });
            },
            evaluate: ({ tokens: [_, test], children }) => {
                bigLoop: while (evaluateExpression(test)) {
                    for (const child of children) {
                        evaluateIndentTree(child);

                        if (getContext("breakingLoop")) {
                            setContext({ breakingLoop: false });
                            break bigLoop;
                        }
                    }
                }
            },
        },
        {
            pattern: ["repeat", type("Number"), ":"],
            onParse: ({ lineNumber }) => {
                setContext({
                    inLoop: [lineNumber, ...(getContext("inLoop") || [])],
                });
            },
            onExitScope: () => {
                setContext({ inLoop: getContext("inLoop").slice(1) });
            },
            evaluate: ({ tokens: [_, test], children }) => {
                let i = 0;
                bigLoop: while (i < evaluateExpression(test)) {
                    for (const child of children) {
                        evaluateIndentTree(child);

                        if (getContext("breakingLoop")) {
                            setContext({ breakingLoop: false });
                            break bigLoop;
                        }
                    }
                    i++;
                }
            },
        },
        {
            pattern: ["for", type("Iterable"), ":"],
            evaluate: ({ tokens: [_, iterable], children }) => {
                for (const item of evaluateExpression(iterable)) {
                    evaluateStatementList(children);
                }
            },
        },
    ],
    PatternMatcher: [
        {
            pattern: [type("varName"), "->"],
        },
    ],
};
