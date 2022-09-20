const String = require("./string");
const Number = require("./number");
const Boolean = require("./boolean");
const Statement = require("./statement");
const Instantiator = require("./instantiator");
const Object = require("./object");
const Iterable = require("./iterable");

const { ANYCHAR } = require("../parse/ruleUtils");
const cleanRuleSet = require("../parse/cleanRuleSet");

const RULES = cleanRuleSet({
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
    ...Instantiator,
    ...Statement,
    ...Iterable,
    ...Object,
    ...String,
    ...Boolean,
    ...Number,
});

const newRule = (typeName, rule) => {
    RULES[typeName].push(rule);
};

const TYPES = { String, Number };

module.exports = { RULES, TYPES, newRule };
