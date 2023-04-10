import { type } from "../../parse/ruleUtils.js";

export default {
    Dictionary: [{ pattern: [type("dictlit")] }],
    dictlit: [{ pattern: ["{", "}"] }],
};
