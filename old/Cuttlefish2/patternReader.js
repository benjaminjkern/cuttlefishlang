const ListOf = (token, separator) => {
    return (input, pattern) => {
        try {
            matchPattern(input, pattern)
        }
    }
}

const ALL_PATTERNS = [
    { returnType: "Process", name: "Assignment", match: [{ type: "ID" }, /\s*/, "=", /\s*/, { type: "Object" }] },
    { returnType: "Process", match: [{ type: "Object" }] },
    { returnType: "ID", match: [/\w+/], saveValue: true },
    { returnType: "Object", match: [/\d+/], saveValue: true },
    { returnType: "Object", match: [{ type: "ID" }] }
];


const input = "x = 5";
const output = { type: "Program", children: [{ type: "Process", name: "Assignment", children: [{ type: "ID", value: "x" }, { type: "Object", value: "5" }] }] };


const makeAST = (inputString, expectedType = "Program") => {
    for (let i in ALL_PATTERNS) {
        const pattern = ALL_PATTERNS[i];
        if (pattern.returnType != expectedType) continue;
        try {
            return matchPattern(inputString, pattern);
        } catch (e) {
            console.log(e);
            continue;
        }
    }
    throw `Did not match any patterns for '${inputString}' on type ${expectedType}`;
}

const matchPattern = (inputString, pattern) => {
    if (typeof pattern.match === 'object' && pattern.match.length !== undefined) {
        if (typeof pattern.match[0] === 'object') {
            if (pattern.match[0].length !== undefined) {

            }
            // regex
        } else if (typeof pattern.match[0] === 'string') {
            if (inputString.startsWith(pattern.match[0])) {
                if (!pattern.saveValue) {
                    return matchPattern(inputString.slice(pattern.match[0].length), pattern.slice(1));
                }
                // TODO FIX
                return matchPattern(inputString.slice(pattern.match[0].length), pattern.slice(1));
            }
            throw `Leading nonterminal tokens did not match!`
        }

        throw 'Pattern was not formatted correctly!'
    }
}