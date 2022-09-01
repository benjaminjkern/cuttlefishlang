const RULES = require("../expressions");

const isTerminal = (token) =>
    typeof token !== "object" || !token.type || !RULES[token.type];

module.exports = { isTerminal };
