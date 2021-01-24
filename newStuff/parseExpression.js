// these are rules that are defined at the macro level,
// they handle all first order type checking as well as expression parsing

const { inspect } = require("util");

const RULES = {
    Object: [
        { pattern: [{ type: "Bool" }] },
        { pattern: [{ type: "Num" }] },
        { pattern: [{ type: "String" }] },
        { pattern: [{ type: "Function" }] },
        { pattern: [{ type: "Collection" }] },
        { op: "select", pattern: [{ type: "Tuple" }, "[", { type: "Int" }, "]"] },
        { op: "select", pattern: [{ type: "List" }, "[", { type: "Int" }, "]"] },
        { op: "apply", pattern: [{ type: "Function" }, { type: "Object" }] },
        { op: "apply", pattern: [{ type: "Object" }, "|>", { type: "Function" }, ] }
    ],
    Process: [
        { pattern: ["print", { type: "String" }] },
        { pattern: ["return", { type: "Object" }] },
        { pattern: ["continue"] },
        { pattern: ["break"] },
        { pattern: ["if", { type: "Bool" }, { type: "Process" }] },
        { pattern: ["if", { type: "Bool" }, { type: "Process" }, "else", { type: "Process" }] },
        { pattern: ["while", { type: "Bool" }, { type: "Process" }] },
        { pattern: ["for", { type: "List" }, { type: "Function" }] }
    ],
    Type: [
        { pattern: ["Type"] },
        { pattern: ["Object"] },
        { pattern: ["Bool"] },
        { pattern: ["Num"] },
        { pattern: ["String"] },
        { op: "funcType", pattern: [{ type: "Type" }, "=>", { type: "Type" }] },
        { op: "setType", pattern: ["{", { type: "Type" }, "}"] },
        { op: "listType", pattern: ["[", { type: "Type" }, "]"] },
        { op: "tupleType", pattern: ["(", { type: "Type" }, ")"] },
        { op: "tupleType", pattern: ["(", { type: "Type" }, ",", ")"] },
        { op: "tupleType", pattern: ["(", { type: "Type" }, ",", { type: "TupleElem" }, ")"] },
        { pattern: [{ type: "genericType" }] },
        { pattern: [{ type: "typelit" }] }
    ],
    TupleElem: [
        { pattern: [{ type: "Type" }] }, { pattern: [{ type: "Type" }, ","] }
    ],
    Collection: [
        { pattern: [{ type: "Set" }] },
        { pattern: [{ type: "List" }] },
        { pattern: [{ type: "Tuple" }] },
    ],
    List: [
        { op: "concat", pattern: [{ type: "List" }, "++", { type: "List" }] },
        { op: "concat", pattern: [{ type: "Object" }, "++", { type: "List" }] },
        { op: "concat", pattern: [{ type: "List" }, "++", { type: "Object" }] },
        { op: "compoundConcat", pattern: [{ type: "List" }, "**", { type: "Int" }] },
        { op: "compoundConcat", pattern: [{ type: "List" }, "**", { type: "Tuple" }] },
        { op: "selectMult", pattern: [{ type: "List" }, { type: "List" }] },
        { op: "filter", pattern: [{ type: "List" }, "[", { type: "Function" }, "]"] },
        { pattern: [{ type: "DiscreteRange" }] },
        { pattern: [{ type: "listlit" }] }
    ],
    Set: [
        { op: "makeset", pattern: ["Set", { type: "Collection" }] },
        { op: "cross", pattern: [{ type: "Set" }, "X", { type: "Set" }] },
        { op: "union", pattern: [{ type: "Set" }, "U", { type: "Set" }] },
        { op: "intersect", pattern: [{ type: "Set" }, "^", { type: "Set" }] },
        { op: "diff", pattern: [{ type: "Set" }, "-", { type: "Set" }] },
        { pattern: [{ type: "ContinuousRange" }] },
        { pattern: [{ type: "setlit" }] }
    ],
    Function: [
        { op: "composition", pattern: [{ type: "Function" }, "*", { type: "Function" }] },
        { op: "compoundComp", pattern: [{ type: "Function" }, "^", { type: "Int" }] },
        { pattern: [{ type: "funclit" }] }
    ],
    String: [{
            op: "concat",
            pattern: [{ type: "String" }, "++", { type: "String" }],
        },
        { pattern: [{ type: "stringlit" }] }
    ],
    Num: [
        { pattern: [{ type: "Int" }] },
        {
            op: "add",
            pattern: [{ type: "Num" }, "+", { type: "Num" }],
        },
        {
            op: "sub",
            pattern: [{ type: "Num" }, "-", { type: "Num" }],
        },
        {
            op: "mult",
            pattern: [{ type: "Num" }, "*", { type: "Num" }],
        },
        {
            op: "mult",
            pattern: [{ type: "Num" }, { type: "Num" }],
        },
        {
            op: "div",
            pattern: [{ type: "Num" }, "/", { type: "Num" }],
        },
        {
            op: "exp",
            pattern: [{ type: "Num" }, "^", { type: "Num" }],
        },
        { op: "neg", pattern: ["-", { type: "Num" }] },
        { op: "imaginary", pattern: [{ type: "Num" }, "i"] },
        { pattern: [{ type: "numlit" }] },
    ],
    Bool: [
        { op: "not", pattern: ["not", { type: "Bool" }] },
        { op: "not", pattern: ["!", { type: "Bool" }] },
        { op: "lt", pattern: [{ type: "Num" }, "<", { type: "Num" }] },
        { op: "gt", pattern: [{ type: "Num" }, ">", { type: "Num" }] },
        { op: "lte", pattern: [{ type: "Num" }, "<=", { type: "Num" }] },
        { op: "gte", pattern: [{ type: "Num" }, ">=", { type: "Num" }] },
        {
            op: "deepEqual",
            pattern: [{ type: "Object" }, "==", { type: "Object" }],
        },
        {
            op: "deepEqual",
            pattern: [{ type: "Object" }, "is", { type: "Object" }],
        },
        {
            op: "shallowEqual",
            pattern: [{ type: "Object" }, "===", { type: "Object" }],
        },
        {
            op: "or",
            pattern: [{ type: "Bool" }, "or", { type: "Bool" }],
        },
        {
            op: "or",
            pattern: [{ type: "Bool" }, "||", { type: "Bool" }],
        },
        {
            op: "nor",
            pattern: [{ type: "Bool" }, "nor", { type: "Bool" }],
        },
        {
            op: "and",
            pattern: [{ type: "Bool" }, "and", { type: "Bool" }],
        },
        {
            op: "and",
            pattern: [{ type: "Bool" }, "&&", { type: "Bool" }],
        },
        {
            op: "nand",
            pattern: [{ type: "Bool" }, "nand", { type: "Bool" }],
        },
        {
            op: "xor",
            pattern: [{ type: "Bool" }, "xor", { type: "Bool" }],
        },
        {
            op: "xnor",
            pattern: [{ type: "Bool" }, "xnor", { type: "Bool" }],
        },
        {
            op: "in",
            pattern: [{ type: "Object" }, "in", { type: "Set" }]
        },
        {
            op: "in",
            pattern: [{ type: "Object" }, "in", { type: "List" }]
        },
        { pattern: [{ type: "boollit" }] },
    ],
};

const matchType = (input, expectedType = "Object", leftover = []) => {
    // return immediately with proper value if passed in a single object that matches type, i dont know if this will ever run honestly
    if (
        input.length === 1 &&
        typeof input[0] === "object" &&
        input[0].type === expectedType
    )
        return { type: expectedType, value: input[0].value };

    // otherwise look through all patterns of the expectedType and match the first one that passes
    // this should actually never run ever
    if (!RULES[expectedType])
        return { error: `Did not match leaf type ${expectedType}` };

    for (let r in RULES[expectedType]) {
        let rule = RULES[expectedType][r];
        let match = matchPattern(input, rule.pattern, leftover);
        if (match.error && leftover.length > 0) continue;
        if (!match.error) {
            let value = {};

            if (match.output.length === 1 && !rule.op) {
                if (match.output[0].value) value = match.output[0].value;
                else value = match.output[0];
            } else {
                if (match.output.length > 0) value = { args: match.output };
                if (rule.op) value.op = rule.op;
            }

            let out = { type: expectedType };
            if (value) out.value = value; // throw out empty array cuz I dont want it
            if (match.notConsumed) out.notConsumed = match.notConsumed;
            return out;
        }
    }

    return { error: `Did not match any pattern in type ${expectedType}` };
};

const matchPattern = (input, pattern, leftover = []) => {
    if (pattern.length + leftover.length > input.length)
        return { error: "Pattern is longer than source string" };

    // no pattern, all clear
    if (pattern.length === 0) {
        if (leftover.length === 0 && input.length > 0)
            return { error: "Empty string cannot generate" };
        return { output: [], notConsumed: input };
    }

    // if the very first node is terminal, it has to match exactly, otherwise its a fail
    if (isTerminal(pattern[0])) {
        if (input.length > 0 && matchTerminal(input[0], pattern[0])) {
            let match = matchPattern(input.slice(1), pattern.slice(1), leftover);
            if (match.error) return match;
            return {
                output: [...getValue(input[0]), ...match.output],
                notConsumed: match.notConsumed,
            };
        }
        return { error: `Did not match "${pattern[0]}" at index 0` };
    }

    if (pattern.length === 1) {
        let match = matchType(input, pattern[0].type, leftover);
        if (match.error) return match;
        return { output: [match], notConsumed: match.notConsumed };
    }

    // now the pattern must look like [{type}, ..., {type}]. It is possible there is nothing in between.
    // find all terminal patterns and make sure they exist within input at least once.

    const fullPattern = [...pattern, ...leftover];

    const terminalPattern = fullPattern
        .reduce(
            (p, c) =>
            isTerminal(c) ? [...p.slice(0, p.length - 1), p[p.length - 1].concat(c)] :
            p.concat([
                []
            ]), [
                []
            ]
        )
        .filter((v) => v.length > 0);
    for (let p in terminalPattern) {
        let checkPattern = terminalPattern[p];
        if (!hasSubArray(input, checkPattern))
            return {
                error: `Could not find "${checkPattern.join("")}" in source string`,
            };
    }

    // count how many times terminal nodes appear in input and pattern, throw error if the input does not meet the expected number of terminal nodes

    const terminalPatternCount = {};
    const terminalInputCount = {};
    fullPattern.forEach((value) => {
        if (isTerminal(value)) {
            let newValue = value.type ? "type:" + value.type : value;
            if (terminalPatternCount[newValue]) terminalPatternCount[newValue]++;
            else terminalPatternCount[newValue] = 1;
        }
    });
    input.forEach((value) => {
        if (isTerminal(value)) {
            let newValue = value.type ? "type:" + value.type : value;
            if (terminalInputCount[newValue]) terminalInputCount[newValue]++;
            else terminalInputCount[newValue] = 1;
        }
    });
    for (let key in terminalPatternCount) {
        if (!terminalInputCount[key] ||
            terminalPatternCount[key] > terminalInputCount[key]
        )
            return { error: `More "${key}"'s in pattern than in input` };
    }

    // finally, expand first node
    let matchedType = matchType(input, pattern[0].type, fullPattern.slice(1));
    if (matchedType.error) return matchedType;

    // the pattern has to have at least 2 nodes to get here anyways
    let matchedPattern = matchPattern(
        matchedType.notConsumed,
        pattern.slice(1),
        leftover
    );
    if (matchedPattern.error) return matchedPattern;
    return {
        output: [matchedType, ...matchedPattern.output],
        notConsumed: matchedPattern.notConsumed,
    };
};

const isTerminal = (node) => typeof node !== "object" || !RULES[node.type];
const matchTerminal = (a, b) =>
    a === b || (a.type && b.type && a.type === b.type);
const getValue = (node) => (node.value ? [node.value] : []);
const hasSubArray = (master, sub) =>
    master.some((_, idx) => isEqual(master.slice(idx, idx + sub.length), sub));
const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

const clean = (node) => {
    if (typeof node !== "object") return node;

    let newNode = {};
    Object.keys(node).forEach((key) => {
        if (key !== "notConsumed") newNode[key] = clean(node[key]);
    });
    return newNode;
};

const parseExpression = (exp, type = "Object") => clean(matchType(exp, type));

module.exports = { parseExpression };

console.log(
    inspect(
        parseExpression(["(", "(", { type: "numlit", value: 5 }, ")", ")"], "Num"),
        false,
        null,
        true
    )
);