const { NOTCHAR, MULTI } = require("../parse/ruleUtils");

const RULES = {
    String: [
        {
            pattern: ['"', MULTI(NOTCHAR('"')), '"'],
            spaces: "specify",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
    ],
};

module.exports = RULES;
