import { ANYCHAR } from "../parse/ruleUtils.js";
import boolean from "./boolean.js";
import cleanRuleSet from "../parse/cleanRuleSet.js";

export default cleanRuleSet({
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
    ...boolean,
});
