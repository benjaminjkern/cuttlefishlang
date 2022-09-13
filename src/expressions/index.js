const String = require("./String");
const Number = require("./Number");

const { ANYCHAR } = require("../parse/ruleUtils");
const cleanRuleSet = require("../parse/cleanRuleSet");

const RULES = cleanRuleSet({
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
    ...String,
    ...Number,
});

const TYPES = { String, Number };

module.exports = { RULES, TYPES };
