const String = require("./String");
const Number = require("./Number");

const { OPTIONAL, MULTI, NOTCHAR, OR, type } = require("../parse/ruleUtils");
const { inspect } = require("../util");

const RULES = {
    space: [{ pattern: [" "] }],
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

/**
 * Spaces:
 * - ignore (default):
 *      Assume there can be an optional space (or many) in between every token. (Not on the outsides)
 * - specify:
 *      You must specify in the pattern itself if you want spaces to be included in the pattern.
 * - require:
 *      Assume there will always be at least one space between every token. (Not on the outsides)
 */

Object.keys(RULES).forEach((typeName) => {
    const ruleSet = RULES[typeName];
    ruleSet.forEach((rule) => {
        // Force spaces and evaluate
        const {
            spaces = "ignore",
            evaluate = () => {},
            staticEvaluate = () => {},
        } = rule;
        switch (spaces) {
            default:
                console.warn(
                    `Warning: invalid spaces configuration: ${spaces}, defaulting to default (ignore)`
                );
            case "require":
            case "ignore":
                rule.pattern = rule.pattern.flatMap((token, i) =>
                    i === rule.pattern.length - 1
                        ? token
                        : [
                              token,
                              MULTI(
                                  type("space"),
                                  spaces === "require" ? 1 : 0
                              ),
                          ]
                );
            case "specify":
                break;
        }
    });
});

console.log(inspect(RULES));

const TYPES = { String, Number };

module.exports = { RULES, TYPES };
