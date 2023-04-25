import { thisSubtype, type } from "../../parse/ruleUtils.js";

export default {
    Dictionary: [{ pattern: [type("dictlit", thisSubtype(0))] }],
    dictlit: [{ pattern: ["{", "}"] }],
};
