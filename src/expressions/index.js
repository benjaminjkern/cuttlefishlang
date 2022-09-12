const String = require("./String");
const Number = require("./Number");

const { OPTIONAL, MULTI, NOTCHAR, OR, type } = require("../parse/ruleUtils");

module.exports = {
    ...String,
    ...Number,
    // N: [
    //     {
    //         pattern: [{ type: "N" }, "-", { type: "N" }],
    //     },
    //     {
    //         pattern: [{ type: "N" }, { type: "N" }],
    //     },
    //     {
    //         pattern: ["-", { type: "N" }],
    //     },
    //     {
    //         pattern: ["n"],
    //     },
    // ],
    // String: [
    //     {
    //         pattern: ['"', { type: "Stringinnerts" }, '"'],
    //     },
    //     {
    //         pattern: ["print", { type: "String" }],
    //     },
    // ],
    // Stringinnerts: [
    //     {
    //         pattern: ["a", { type: "Stringinnerts" }],
    //     },
    //     {
    //         pattern: [],
    //     },
    // ],
    // A: [
    //     { pattern: ["0", { type: "A" }, "1"] },
    //     { pattern: ["123", { type: "B" }, { type: "B" }] },
    // ],
    // B: [
    //     { pattern: ["123", { type: "A" }, { type: "B" }] },
    //     { pattern: [{ type: "D" }] },
    // ],
    // C: [
    //     {
    //         pattern: ["456", { type: "D" }, { type: "D" }],
    //     },
    //     {
    //         pattern: [{ type: "D" }, "4567891021947124575"],
    //     },
    // ],
    // D: [{ pattern: ["214585591519"] }, { pattern: [] }],
    // A: [
    //     {
    //         pattern: [
    //             "o",
    //             OPTIONAL(
    //                 OR(
    //                     type("A"),
    //                     MULTI("02", 2, 9),
    //                     "799",
    //                     NOTCHAR("258102595932858467890d")
    //                 )
    //             ),
    //             MULTI("a", 0, 9),
    //         ],
    //     },
    // ],
};
