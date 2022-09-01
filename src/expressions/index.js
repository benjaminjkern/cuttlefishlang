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
    A: [
        { pattern: ["0", { type: "A" }, "1"] },
        { pattern: ["123", { type: "B" }, { type: "B" }] },
    ],
    B: [
        { pattern: ["123", { type: "A" }, { type: "A" }] },
        { pattern: ["123", { type: "A" }, { type: "B" }] },
        { pattern: ["8000", { type: "D" }] },
    ],
    C: [
        {
            pattern: ["456", { type: "D" }, { type: "D" }],
        },
        {
            pattern: ["4567891021947124575", { type: "D" }],
        },
    ],
    D: [{ pattern: ["214585591519"] }, { pattern: [] }],
};
