const { ANYCHAR, MULTI, OPTIONAL, type } = require("../parse/ruleUtils");

module.exports = {
    Number: [
        {
            pattern: [type("Number"), "+", type("Number")],
            spaces: "dont-ignore",
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("Number"), "-", type("Number")],
            spaces: "dont-ignore",
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() - b.evaluate(),
        },
        {
            pattern: [type("Number"), "*", type("Number")],
            spaces: "dont-ignore",
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("Number"), "/", type("Number")],
            spaces: "dont-ignore",
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("numlit")],
            spaces: "dont-ignore",
            evaluate: ({ sourcestring }) => +sourcestring,
        },
    ],
    numlit: [
        { pattern: [MULTI(type("digit"), 1)] },
        { pattern: [MULTI(type("digit")), ".", MULTI(type("digit"), 1)] },
    ],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
};
