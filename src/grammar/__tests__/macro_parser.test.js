const fs = require("fs");
const parse_macros = require("../macro_parser.js");
const program = fs.readFileSync("sample_programs/macroTest.w", "utf-8");

const macroExample = `
#! ( append (get generics) a b c)
`


describe("Macro parsing", () => {
    test("Doesn't fail to parse some valid macros", () => {
        expect(parse_macros(program)).toBeDefined();
    });
    test("Successfully adds item to context list", () => {
        expect(parse_macros(macroExample)).toMatchObject({generics:["a","b","c"]});
    });

});
