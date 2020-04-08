/*
 * Grammar Error Tests
 *
 * Checks that our grammar will reject programs with various syntax errors.
 */

const checkSyntax = require("../syntax_checker");

const errors = [
    ["unclosed paren", "x = (2 * 3"],
    ["empty program", ""]
];

describe("The syntax checker", () => {
    errors.forEach(([scenario, program]) => {
        test(`detects the error ${scenario}`, () => {
            expect(checkSyntax(program)).toBe(false);
        });
    });
});