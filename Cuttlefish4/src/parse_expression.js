const RULES = require('./default_patterns');
const { TYPES, findSuperTypes } = require('./default_types');
const { inspect } = require('./utils');

require('colors');

RULES.Real.push(...RULES.Num);
RULES.Int.push(...RULES.Num);

Object.keys(TYPES).forEach(type => {
    if (!TYPES[type].subtypes) return;
    if (!RULES[type]) RULES[type] = [];
    TYPES[type].subtypes.forEach(subtype => {
        RULES[type].push({ pattern: [{ type: subtype }] });
    });
})

const matchType = (input, expectedType = "Object", leftover = []) => {
    // return immediately with proper value if passed in a single object that matches type, i dont know if this will ever run honestly
    // if (
    //     input.length === 1 &&
    //     typeof input[0] === "object" &&
    //     input[0].type === expectedType
    // )
    //     return { type: expectedType, value: input[0].value };

    // otherwise look through all patterns of the expectedType and match the first one that passes
    // this should actually never run ever
    if (!RULES[expectedType])
        return { error: `Did not match leaf type ${expectedType}` };

    for (let r in RULES[expectedType]) {
        let rule = RULES[expectedType][r];
        tabs++;
        // console.log(`${Array(tabs - 1).fill('   ').join('')}Matching ${inspect(input).yellow} to ${inspect(rule.pattern).blue} with ${inspect(leftover).green} left over`);
        let match = matchPattern(input, rule.pattern, leftover);
        // console.log(Array(tabs - 1).fill('   ').join('') + (match.error ? 'X '.red + match.error.magenta : 'O '.green + inspect(match, true)))
        tabs--;
        if (match.error && leftover.length > 0) continue;
        if (!match.error) {
            let value = {};

            if (match.output.length === 1 && !rule.evaluate) {
                if (match.output[0].value) value = match.output[0].value;
                else value = match.output[0];
            } else {
                if (match.output.length > 0) value = { args: match.output };
                if (rule.evaluate) value.evaluate = rule.evaluate;
            }

            let out = { type: match.output.length > 1 ? expectedType : match.output[0].type };
            if (value) out.value = value; // throw out empty array cuz I dont want it
            if (match.notConsumed) out.notConsumed = match.notConsumed;
            return out;
        }
    }

    if (
        input.length >= 1 &&
        typeof input[0] === "object" &&
        input[0].type === expectedType
    )
        return { type: expectedType, value: input[0].value, notConsumed: input.slice(1) };

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
    // console.log(inspect(pattern).yellow);
    // console.log(inspect([matchedType, ...matchedPattern.output]).red);
    return {
        output: [matchedType, ...matchedPattern.output],
        notConsumed: matchedPattern.notConsumed || [],
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

    let newNode = node.length === undefined ? {} : [];
    Object.keys(node).forEach((key) => {
        if (key !== "notConsumed") newNode[key] = clean(node[key]);
    });
    return newNode;
};

const parseExpression = (exp, type = "Object", seen = {}) => {
    for (const token of exp) {
        if (token.error) return token;
    }

    let match = matchType(exp, type);
    if ((!match.notConsumed || !match.notConsumed.length) && !match.error) return clean(match);

    // seen[type] = true;
    // const superTypes = findSuperTypes(type);
    // for (const superType of superTypes) {
    //     if (seen[superType]) continue;
    //     const superMatch = parseExpression(exp, superType);
    //     console.log(superMatch);
    //     if (!superMatch.error) return {...superMatch, type };
    // }

    return { error: `Failed to match "${exp.map(v=>v.type?"("+v.type+")":v).join(" ")}" to ${type}!` };
};

module.exports = parseExpression;
const evaluate = (exp) => {
    if (exp.value && exp.value.evaluate) {
        const evaluatedArgs = exp.value.args.map(arg => evaluate(arg));
        return exp.value.evaluate(...evaluatedArgs)
    }
    return exp;
}

let tabs = 0;

// const Node = parseExpression([], "Real");
const Node2 = parseExpression([{ type: 'Int', value: 2239 }, "-", { type: "Int", value: 47 }, "^", { type: "Int", value: 9 }], "Int");


// console.log(inspect(Node2, true));
console.log(evaluate(Node2));