const RULES = {
    N: [{
            pattern: [{ type: "N" }, "-", { type: "N" }]
        }, {
            pattern: [{ type: "N" }, { type: "N" }]
        },
        {
            pattern: ["-", { type: "N" }]
        }, {
            pattern: ["n"]
        },
    ]
}
const minLengthCache = {}
const getMinLength = (type) => {
    if (minLengthCache[type]) return minLengthCache[type];
    minLengthCache[type] = Number.MAX_SAFE_INTEGER;
    for (const rule of RULES[type]) {
        let length = 0;
        for (const token of rule.pattern) {
            if (isTerminal(token)) length += 1;
            else if (token.type === type) {
                length = Number.MAX_SAFE_INTEGER;
                break;
            } else length += getMinLength(token.type);
        }
        minLengthCache[type] = Math.min(minLengthCache[type], length);
    }
    return minLengthCache[type];
}

const getStartPatterns = (type, seen = {}) => {
    seen[type] = true;
    const startPatterns = [];
    for (const rule of RULES[type]) {
        let currentPatterns = [
            []
        ];
        let beginToken = rule.pattern[0];
        if (!isTerminal(beginToken)) {
            if (!seen[beginToken.type]) currentPatterns = currentPatterns.reduce((p, pattern) => {
                const otherStartPatterns = getStartPatterns(beginToken.type, seen);
                return [...p, ...otherStartPatterns.map(oPattern => [...pattern, ...oPattern])]
            }, []);
            currentPatterns = currentPatterns.map(pattern => [...pattern, "type:" + beginToken.type]);
        }
        for (const token of rule.pattern) {
            if (isTerminal(token)) currentPatterns = currentPatterns.map(pattern => [...pattern, token]);
            else {
                if (!seen[token.type]) currentPatterns = currentPatterns.reduce((p, pattern) => {
                    const otherStartPatterns = getStartPatterns(token.type, seen);
                    return [...p, ...otherStartPatterns.map(oPattern => [...pattern, ...oPattern])]
                }, []);
                break;
            }
        }
        startPatterns.push(...currentPatterns.filter(pattern => pattern.length > 0));
    }
    // remove redundancies
    for (let i = 0; i < startPatterns.length; i++) {
        const patternString = startPatterns[i].join(',');
        for (let j = i + 1; j < startPatterns.length; j++) {
            const existingPattern = startPatterns[j].join(',');
            if (existingPattern.length > patternString.length && existingPattern.slice(0, patternString.length) === patternString) {
                startPatterns[j] = null;
                break;
            }
            if (patternString.slice(0, existingPattern.length) === existingPattern) {
                startPatterns[i] = null;
                break;
            }
        }
    }
    return startPatterns.filter(pattern => pattern);
}

const getEndPatterns = (type, seen = {}) => {
    seen[type] = true;
    const endPatterns = [];
    for (const rule of RULES[type]) {
        let currentPatterns = [
            []
        ];
        const reversedPattern = [...rule.pattern].reverse();
        let beginToken = reversedPattern[0];
        if (!isTerminal(beginToken)) {
            if (!seen[beginToken.type]) currentPatterns = currentPatterns.reduce((p, pattern) => {
                const otherEndPatterns = getEndPatterns(beginToken.type, {...seen });
                return [...p, ...otherEndPatterns.map(oPattern => [...oPattern, ...pattern])]
            }, []);
            currentPatterns = currentPatterns.map(pattern => [beginToken, ...pattern]);
        }
        for (const token of reversedPattern) {
            if (isTerminal(token)) currentPatterns = currentPatterns.map(pattern => [token, ...pattern]);
            else {
                if (!seen[token.type]) currentPatterns = currentPatterns.reduce((p, pattern) => {
                    const otherEndPatterns = getEndPatterns(token.type, {...seen });
                    return [...p, ...otherEndPatterns.map(oPattern => [...oPattern, ...pattern])]
                }, []);
                break;
            }
        }
        endPatterns.push(...currentPatterns.filter(pattern => pattern.length > 0));
    }
    // remove redundancies
    for (let i = 0; i < endPatterns.length; i++) {
        if (!endPatterns[i]) break;
        const patternString = endPatterns[i].join(',');
        for (let j = i + 1; j < endPatterns.length; j++) {
            const existingPattern = endPatterns[j].join(',');
            if (existingPattern.length > patternString.length && existingPattern.slice(existingPattern.length - patternString.length) === patternString) {
                endPatterns[j] = null;
                break;
            }
            if (patternString.slice(patternString.length - existingPattern.length) === existingPattern) {
                endPatterns[i] = null;
                break;
            }
        }
    }
    return endPatterns.filter(pattern => pattern);
}

const getDictionary = (type, seen = {}) => {
    seen[type] = true;
    const dict = {};
    for (const rule of RULES[type]) {
        for (const token of rule.pattern) {
            if (isTerminal(token)) dict[token] = true;
            else {
                dict['type:' + token.type] = true;
                if (token.type !== type) Object.keys(getDictionary(token.type, seen)).forEach(newToken => dict[newToken] = true);
            }

        }
    }
    return dict;
}

const isTerminal = (token) => typeof token !== 'object' || !token.type || !RULES[token.type];

const HEURISTICS = Object.keys(RULES).reduce((p, type) => ({...p, [type]: { minLength: getMinLength(type), startPatterns: getStartPatterns(type), endPatterns: getEndPatterns(type), dict: getDictionary(type) } }), {});






const parseExpression = (pattern, expression) => {
    debugstart("parseExpression", [pattern, expression])
    const possibleRegexes = allMatches(pattern, expression);
    if (possibleRegexes.length === 0) return debugreturn(false);
    for (const lengths of possibleRegexes) {
        if (pattern.every((patternToken, i) => {
                const expectedExpression = expression.slice(lengths[i - 1] || 0, lengths[i]);
                if (isTerminal(patternToken)) return patternToken === expectedExpression[0];
                return parseType(patternToken.type, expectedExpression);
            })) {
            return debugreturn(true);
        }
    }
    return debugreturn(false);
};

const parseType = (type, expression) => {
    debugstart("parseType", [type, expression]);
    if (!matchToType(type, expression)) return debugreturn(false);
    if (expression.length === 1 && !isTerminal(expression[0]) && type === expression[0].type) return debugreturn(true);
    for (const rule of RULES[type]) {
        if (parseExpression(rule.pattern, expression)) return debugreturn(true);
    }
    return debugreturn(false);
}

const allMatches = (pattern, expression) => {
    debugstart("allMatches", [pattern, expression]);
    if (pattern.length === 0)
        return debugreturn(expression.length === 0 ? [
            []
        ] : []);

    if (pattern.reduce((p, token) => p + (isTerminal(token) ? 1 : HEURISTICS[token.type].minLength), 0) > expression.length) return debugreturn([]);

    if (isTerminal(pattern[0])) return debugreturn(allMatches(pattern.slice(1), expression.slice(1)).map(match => [1, ...match.map(len => len + 1)]));

    const matches = [];
    for (let i = 0; i <= expression.length; i++) {
        if (matchToType(pattern[0].type, expression.slice(0, i))) matches.push(...allMatches(pattern.slice(1), expression.slice(i)).map(match => [i, ...match.map(len => len + i)]));
    }
    return debugreturn(matches);
}

const matchToType = (type, expression) => {
    debugstart("matchToType", [type, expression]);
    const regex = HEURISTICS[type];

    // if (expression.length === 1 && !isTerminal(expression[0]) && type === expression[0].type) return debugreturn(true);
    if (expression.length < regex.minLength) return debugreturn(false);
    if (regex.startPatterns.every(pattern => !pattern.every((token, i) => token === expression[i]))) return debugreturn(false);
    if (regex.endPatterns.every(pattern => !pattern.every((token, i) => token === expression[expression.length - pattern.length + i]))) return debugreturn(false);
    return debugreturn(expression.every(token => regex.dict[token]));
}

const debugstart = (functionName, args) => {
    if (DEBUG) console.log(`${Array(spaces).fill(' ').join('')}${functionName}(${args.map(toString).join(', ')}) {`);
    spaces += 3;
}

const debugreturn = (value) => {
    spaces -= 3;
    if (DEBUG) console.log(`${Array(spaces).fill(' ').join('')}} -> ${toString(value)}`);
    return value;
}

const toString = (obj) => {
    if (typeof obj !== 'object') return obj;
    if (obj.length) return '[' + obj.map(toString).join(',') + ']';
    return '{' + Object.keys(obj).map(key => key + ":" + toString(obj[key])) + "}";
}

let spaces = 0;

let DEBUG = false;

console.log(require('util').inspect(HEURISTICS, false, null, true));
console.log(parseType("N", '---------------------------------n'.split('')));
// console.log(parseType("N", 'n-nn-nnn-n-nn-n-nn-n-n-n'.split('')));
// console.log(parseType("A", ['0', '0', '1', '1']))