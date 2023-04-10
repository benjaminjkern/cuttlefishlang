import { ANYCHAR } from "../parse/ruleUtils.js";

export const RULES = {
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
};

export const newRuleList = (typeName, ruleList) => {
    RULES[typeName].push(ruleList);
};
