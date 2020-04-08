/*
 * Grammar Success Test
 *
 * These tests check that our grammar accepts a program that features all of
 * syntactic forms of the language.
 */

const fs = require("fs");
const checkSyntax = require("../syntax_checker");

const program = fs.readFileSync("sample_programs/super_program.w", "utf-8");

console.log(checkSyntax(program).message);

describe("The syntax checker", () => {
    test("accepts the mega program with all syntactic forms", () => {
        expect(checkSyntax(program).succeeded()).toBe(true);
    });
});