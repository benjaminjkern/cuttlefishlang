const { NOTCHAR, MULTI } = require("../parse/ruleUtils");
module.exports = {
    String: [
        {
            pattern: ['"', MULTI(NOTCHAR('"')), '"'],
            spaces: "specify",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
        {
            pattern: ["'", MULTI(NOTCHAR('"')), "'"],
            spaces: "specify",
            evaluate: ({ sourceString }) =>
                sourceString.substring(1, sourceString.length - 1),
        },
    ],
};
