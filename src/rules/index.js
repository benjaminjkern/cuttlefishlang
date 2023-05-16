import { ANYCHAR } from "../parse/ruleUtils.js";

import cleanRuleSet from "./cleanRuleSet.js";

import statement from "./statement.js";
import instantiator from "./instantiator.js";

import boolean from "./expressions/boolean.js";
import dictionary from "./expressions/dictionary.js";
import iterable from "./expressions/iterable.js";
import number from "./expressions/number.js";
import object from "./expressions/object.js";
import string from "./expressions/string.js";
import functions from "./expressions/function.js"; // "function" is a js keyword
import tuple from "./expressions/tuple.js";

export default cleanRuleSet({
    space: [{ pattern: [" "] }],
    digit: [{ pattern: [ANYCHAR("0123456789")] }],
    ...statement,
    ...instantiator,

    ...boolean,
    ...dictionary,
    ...iterable,
    ...number,
    ...object,
    ...string,
    // ...functions,
    ...tuple,
});
