/*
 * Grammar Error Tests
 *
 * Checks that our grammar will reject programs with various syntax errors.
 */

const syntaxCheck = require("../syntax-checker");

const errors = [
    ["unclosed paren", "x = (2 * 3"],
    ["empty program", ""]
];

describe("The syntax checker", () => {
    errors.forEach(([scenario, program]) => {
        test(`detects the error ${scenario}`, done => {
            expect(syntaxCheck(program)).toBe(false);
            done();
        });
    });
});