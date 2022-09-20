const {
    evaluateExpression,
    evaluateStatementList,
    evaluateIndentTree,
} = require("../parse/evaluate");
const {
    setContext,
    getContext,
    setVariable,
    newParseVariable,
} = require("../parse/parseExpression");
const { type, OR, OPTIONAL } = require("../parse/ruleUtils");

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
                loop(() => evaluateExpression(test), children);
            },
        },
        {
            pattern: ["repeat", OPTIONAL(type("Number")), ":"],
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

                loop(() => {
                    i++;
                    if (test.length) return i < evaluateExpression(test);
                    return true;
                }, children);
            },
        },
        {
            pattern: ["for", type("Iterable"), ":"],
            onParse: ({ lineNumber }) => {
                newParseVariable("Object", "$");
            },
            onExitScope: () => {
                removeParseVariable("$");
            },
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

const loop = (testFunc, children) => {
    bigLoop: while (testFunc()) {
        for (const child of children) {
            evaluateIndentTree(child);

            if (getContext("breakingLoop")) {
                setContext({ breakingLoop: false });
                break bigLoop;
            }
            if (getContext("continuingLoop")) {
                setContext({ continuingLoop: false });
                break;
            }
        }
    }
};
