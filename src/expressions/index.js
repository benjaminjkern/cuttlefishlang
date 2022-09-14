const String = require("./string");
const Number = require("./number");
const Boolean = require("./boolean");
const Statement = require("./statement");
const Instantiator = require("./instantiator");
const Object = require("./object");

const { RULES } = require("../parse/ruleUtils");

const { ANYCHAR } = require("../parse/ruleUtils");
const cleanRuleSet = require("../parse/cleanRuleSet");

cleanRuleSet({
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
    ...Instantiator,
    ...Statement,
    ...Object,
    ...String,
    ...Boolean,
    ...Number,
});

const TYPES = { String, Number };

module.exports = { RULES, TYPES };
