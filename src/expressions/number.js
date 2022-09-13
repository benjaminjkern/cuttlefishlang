const { ANYCHAR, MULTI, OPTIONAL, type } = require("../parse/ruleUtils");

module.exports = {
    Number: [
        {
            pattern: [type("Number"), "-", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() - b.evaluate(),
        },
        {
            pattern: [type("Number"), "+", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("Number"), "/", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("Number"), "*", type("Number")],
            evaluate: ({ tokens: [a, _, b] }) => a.evaluate() + b.evaluate(),
        },
        {
            pattern: [type("numlit")],
            spaces: "specify", // This actually shouldnt matter
            evaluate: ({ sourcestring }) => +sourcestring,
        },
    ],
    numlit: [
        { pattern: [MULTI(type("digit"), 1)] },
        { pattern: [MULTI(type("digit")), ".", MULTI(type("digit"), 1)] },
    ],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
};
