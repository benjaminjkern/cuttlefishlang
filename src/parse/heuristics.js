const { isTerminal } = require("../util/parsingUtils");
const { inspect } = require("../util");

const RULES = require("../expressions");

const HEURISTICS = {
    types: {
        // [type]: {
        //     [typeHeuristic]: value,
        // },
    },
    typeHeuristics: {
        // [typeHeuristic]: (type, expression) => boolean,
    },
};

// This is so it can be accessed later by the start and end dict function
let toAddHeuristics;

const generateHeuristics = () => {
    toAddHeuristics = {};

    toAddHeuristics.minLength = getMinLengths();
    HEURISTICS.typeHeuristics.minLength = (type, expression) =>
        expression.length < HEURISTICS.types[type].minLength && {
            error: `"${expression}" is shorter than the minimum possible length (${HEURISTICS.types[type].minLength}) for type: ${type}!"`,
        };

    toAddHeuristics.maxLength = getMaxLengths();
    HEURISTICS.typeHeuristics.maxLength = (type, expression) =>
        expression.length > HEURISTICS.types[type].maxLength && {
            error: `"${expression}" is longer than the maximum possible length (${HEURISTICS.types[type].maxLength}) for type: ${type}!"`,
        };

    toAddHeuristics.dict = getDicts();
    HEURISTICS.typeHeuristics.dict = (type, expression) => {
        for (const token of expression) {
            if (!HEURISTICS.types[type].dict[token])
                return {
                    error: `'${token}' is not in the set of allowed tokens for type: ${type}!"`,
                };
        }
        return true;
    };
    toAddHeuristics.startDict = getStartDicts();
    HEURISTICS.typeHeuristics.startDict = (type, expression) =>
        !HEURISTICS.types[type].startDict[expression[0]] && {
            error: `'${expression[0]}' is not in the set of start tokens for type: ${type}!"`,
        };
    toAddHeuristics.endDict = getEndDicts();
    HEURISTICS.typeHeuristics.endDict = (type, expression) =>
        !HEURISTICS.types[type].endDict[expression[expression.length - 1]] && {
            error: `'${
                expression[expression.length - 1]
            }' is not in the set of end tokens for type: ${type}!"`,
        };

    // Attach each heuristic
    for (const type in RULES) {
        HEURISTICS.types[type] = {};
        for (const heuristic in HEURISTICS.typeHeuristics) {
            HEURISTICS.types[type][heuristic] =
                toAddHeuristics[heuristic][type];
        }
    }
};

/*************************
 * Min Length functions
 *************************/

const getMinLengths = () => {
    const minLengths = {};
    for (const type in RULES) {
        minLengths[type] = getTypeMinLength(type);
    }
    return minLengths;
};

const getTypeMinLength = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;
    let min = Number.MAX_SAFE_INTEGER;
    for (const { pattern } of RULES[type]) {
        let currentLength = 0;
        for (const token of pattern) {
            if (isTerminal(token)) {
                currentLength += token.length;
                continue;
            }
            const length = getTypeMinLength(
                token.type,
                { ...parentCalls },
                cache
            );

            currentLength += length;
            if (currentLength >= Number.MAX_SAFE_INTEGER) {
                currentLength = Number.MAX_SAFE_INTEGER;
                break;
            }
        }
        min = Math.min(min, currentLength);
        if (min === 0) break;
    }
    cache[type] = min;
    return min;
};

/*************************
 * Max Length functions
 *************************/

const getMaxLengths = () => {
    const maxLengths = {};
    for (const type in RULES) {
        maxLengths[type] = getTypeMaxLength(type);
    }
    return maxLengths;
};

const getTypeMaxLength = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = Number.MAX_SAFE_INTEGER;
        return cache[type];
    }
    parentCalls[type] = true;
    let max = 0;
    for (const { pattern } of RULES[type]) {
        let currentLength = 0;
        for (const token of pattern) {
            if (isTerminal(token)) {
                currentLength += token.length;
                continue;
            }
            const length = getTypeMaxLength(
                token.type,
                { ...parentCalls },
                cache
            );

            currentLength += length;
            if (currentLength >= Number.MAX_SAFE_INTEGER) {
                currentLength = Number.MAX_SAFE_INTEGER;
                break;
            }
        }
        max = Math.max(max, currentLength);
        if (max === Number.MAX_SAFE_INTEGER) break;
    }
    cache[type] = max;
    return max;
};

/*************************
 * Dict functions
 *************************/

const getDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeDict(type);
    }
    return dicts;
};

const getTypeDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = {};
        return cache[type];
    }
    parentCalls[type] = true;
    let dict = {};
    for (const { pattern } of RULES[type]) {
        for (const token of pattern) {
            if (isTerminal(token)) {
                token
                    .split("")
                    .forEach((character) => (dict[character] = true));
                continue;
            }
            const typeDict = getTypeDict(token.type, { ...parentCalls }, cache);

            dict = { ...dict, ...typeDict };
        }
    }
    cache[type] = dict;
    return dict;
};

/*************************
 * Start Dict functions
 *************************/

const getStartDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeStartDict(type);
    }
    return dicts;
};

const getTypeStartDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = {};
        return cache[type];
    }
    parentCalls[type] = true;
    let startDict = {};
    for (const { pattern } of RULES[type]) {
        for (const token of pattern) {
            if (isTerminal(token)) {
                if (token.length) {
                    startDict[token[0]] = true;
                    break;
                }
                continue;
            }
            const typeStartDict = getTypeStartDict(
                token.type,
                { ...parentCalls },
                cache
            );

            startDict = { ...startDict, ...typeStartDict };

            if (toAddHeuristics.minLength[token.type]) break;
        }
    }
    cache[type] = startDict;
    return startDict;
};

/*************************
 * End Dict functions
 *************************/

const getEndDicts = () => {
    const dicts = {};
    for (const type in RULES) {
        dicts[type] = getTypeEndDict(type);
    }
    return dicts;
};

const getTypeEndDict = (type, parentCalls = {}, cache = {}) => {
    if (cache[type] !== undefined) return cache[type];
    if (parentCalls[type]) {
        cache[type] = {};
        return cache[type];
    }
    parentCalls[type] = true;
    let endDict = {};
    for (const { pattern } of RULES[type]) {
        for (let i = pattern.length - 1; i >= 0; i--) {
            const token = pattern[i];
            if (isTerminal(token)) {
                if (token.length) {
                    endDict[token[token.length - 1]] = true;
                    break;
                }
                continue;
            }
            const typeEndDict = getTypeEndDict(
                token.type,
                { ...parentCalls },
                cache
            );

            endDict = { ...endDict, ...typeEndDict };

            if (toAddHeuristics.minLength[token.type]) break;
        }
    }
    cache[type] = endDict;
    return endDict;
};

// const objectMap = (object, func) => {
//     return Object.keys(object).reduce(
//         (p, key) => ({ ...p, [key]: func(object[key], key) }),
//         {}
//     );
// };

// const addValueToOptions = (A, options) => {
//     if (typeof A === "number")
//         return options.map(({ value, nonterminals }) => ({
//             value: value + A,
//             nonterminals,
//         }));
//     const { value: toAddValue, nonterminals: toAddNonterminals } = A;
//     return options.map(({ value, nonterminals }) => ({
//         value: value + toAddValue,
//         nonterminals: objectMap(
//             nonterminals,
//             (count, key) => count + toAddNonterminals[key]
//         ),
//     }));
// };

// const multiplyOptions = (A, options) => {
//     return options.map(({ value, nonterminals }) => ({
//         value: value * A,
//         nonterminals: objectMap(nonterminals, (x) => x * A),
//     }));
// };

// const replaceValues = (options, typeToReplace, replaceValue) => {
//     return options.flatMap((option) => {
//         const { value, nonterminals } = option;
//         if (!nonterminals[typeToReplace]) return option;
//         const { [typeToReplace]: count, ...rest } = nonterminals;
//         if (typeof replaceValue === "number")
//             return { value: value + count * replaceValue, nonterminals: rest };
//         return addValueToOptions(
//             { value, nonterminals: rest },
//             multiplyOptions(count, replaceValue)
//         );
//     });
// };

// /*********
//  * Max length
//  */

// const makeHeuristic = (getFunction, rules, ...args) => {
//     const values = {};
//     for (const type in rules) {
//         values[type] = getFunction(type, rules, values, ...args);
//     }
//     return values;
// };

// const getMaxLength = (type, rules, values) => {
//     if (values[type] !== undefined) return values[type];
//     values[type] = 0;

//     for (const { pattern } of rules[type]) {
//         let patternMaxLength = 0;
//         for (const token of pattern) {
//             if (isTerminal(token)) {
//                 patternMaxLength += token.length;
//                 continue;
//             }
//             if (token.type === type) {
//                 values[type] = Number.MAX_SAFE_INTEGER;
//                 return values[type];
//             }
//             patternMaxLength += getMaxLength(token.type, rules, values);
//             if (patternMaxLength >= Number.MAX_SAFE_INTEGER) {
//                 values[type] = Number.MAX_SAFE_INTEGER;
//                 return values[type];
//             }
//         }
//         values[type] = Math.max(values[type], patternMaxLength);
//     }
//     return values[type];
// };

// const getDict = (type, rules, values) => {
//     if (values[type] !== undefined) return values[type];
//     values[type] = { whitelist: {} };
//     for (const { pattern } of rules[type]) {
//         for (const token of pattern) {
//             if (isTerminal(token)) {
//                 values[type] = combineTokenDicts(values[type], {
//                     whitelist: makeSet(token.split("")),
//                 });
//                 continue;
//             }
//             if (token.type === type) continue;
//             values[type] = combineTokenDicts(
//                 values[type],
//                 getDict(token.type, rules, values)
//             );
//         }
//     }
//     return values[type];
// };

// const getStartTokens = (type, rules, values, heuristics) => {
//     if (values[type] !== undefined) return values[type];
//     values[type] = { whitelist: {} };
//     for (const { pattern } of rules[type]) {
//         for (const token of pattern) {
//             if (isTerminal(token)) {
//                 values[type] = combineTokenDicts(values[type], {
//                     whitelist: makeSet([token[0]]),
//                 });
//                 if (token.length) break;
//                 continue;
//             }
//             if (token.type !== type)
//                 values[type] = combineTokenDicts(
//                     values[type],
//                     getStartTokens(token.type, rules, values, heuristics)
//                 );

//             if (heuristics.minLength[token.type]) break;
//         }
//     }
//     return values[type];
// };

// const getEndTokens = (type, rules, values, heuristics) => {
//     if (values[type] !== undefined) return values[type];
//     values[type] = { whitelist: {} };
//     for (const { pattern } of rules[type]) {
//         const reversedPatterns = [...pattern].reverse();
//         for (const token of reversedPatterns) {
//             if (isTerminal(token)) {
//                 values[type] = combineTokenDicts(values[type], {
//                     whitelist: makeSet([token[token.length - 1]]),
//                 });
//                 if (token.length) break;
//                 continue;
//             }
//             if (token.type !== type)
//                 values[type] = combineTokenDicts(
//                     values[type],
//                     getEndTokens(token.type, rules, values, heuristics)
//                 );
//             if (heuristics.minLength[token.type]) break;
//         }
//     }
//     return values[type];
// };

// const combineTokenDicts = (A, B) => {
//     if (A.blacklist) {
//         if (B.blacklist)
//             return { blacklist: intersect(A.blacklist, B.blacklist) };
//         return { blacklist: subtract(A.blacklist, B.whitelist) };
//     }
//     if (B.blacklist) return { blacklist: subtract(B.blacklist, A.whitelist) };
//     return { whitelist: union(A.whitelist, B.whitelist) };
// };

// if (!heuristics.endTokens[forceTerminal(expression[expression.length - 1])])
//     return {
//         error: `'${
//             expression[expression.length - 1]
//         }' is not in the set of end tokens for type: ${type}!"`,
//     };

generateHeuristics();
module.exports = HEURISTICS;

console.log(inspect(HEURISTICS));
