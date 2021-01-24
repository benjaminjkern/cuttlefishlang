const { parseExpression } = require("../parseExpression");

const exps = [
    [
        "parses print", ["print", { type: "String", value: "my balls" }],
        "Statement",
        {
            type: "Statement",
            value: {
                op: "print",
                args: { 0: { type: "Object", value: "my balls" } },
            },
        },
    ],
    [
        "parses numlit", [{ type: "numlit", value: "92" }],
        "Num",
        { type: "Num", value: "92" },
    ],
    [
        "parses addition", [{ type: "numlit", value: "9" }, "+", { type: "numlit", value: "7" }],
        "Num",
        {
            type: "Num",
            value: {
                op: "add",
                args: {
                    0: { type: "Num", value: "9" },
                    1: { type: "Num", value: "7" },
                },
            },
        },
    ],
    [
        "parses complicated arithemetic", [
            "(",
            { type: "numlit", value: "9" },
            "+",
            { type: "numlit", value: "7" },
            ")",
            "*",
            { type: "numlit", value: "6" },
        ],
        "Num",
        {
            type: "Num",
            value: {
                op: "mult",
                args: {
                    0: {
                        type: "Num",
                        value: {
                            op: "add",
                            args: {
                                0: { type: "Num", value: "9" },
                                1: { type: "Num", value: "7" },
                            },
                        },
                    },
                    1: { type: "Num", value: "6" },
                },
            },
        },
    ],
];

describe("The Expression Parser", () => {
    exps.forEach(([scenario, program, type, expected]) => {
        test(scenario, () => {
            expect(isEqual(parseExpression(program, type), expected)).toBe(true);
        });
    });
});

const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};