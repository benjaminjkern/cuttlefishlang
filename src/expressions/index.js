module.exports = {
    N: [
        {
            pattern: [{ type: "N" }, "-", { type: "N" }],
        },
        {
            pattern: [{ type: "N" }, { type: "N" }],
        },
        {
            pattern: ["-", { type: "N" }],
        },
        {
            pattern: ["n"],
        },
    ],
    String: [
        {
            pattern: ['"', { type: "Stringinnerts" }, '"'],
        },
        {
            pattern: ["print", { type: "String" }],
        },
    ],
    Stringinnerts: [
        {
            pattern: ["a", { type: "Stringinnerts" }],
        },
        {
            pattern: [],
        },
    ],
    B: [
        // { pattern: [] },
        { pattern: ["123", { type: "A" }, { type: "A" }] },
        { pattern: ["123", { type: "A" }, { type: "B" }] },
        { pattern: ["8000"] },
    ],
    A: [
        { pattern: ["0", { type: "A" }, "1"] },
        { pattern: ["123", { type: "B" }, { type: "B" }] },
    ],
};
