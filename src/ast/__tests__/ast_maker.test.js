const fs = require("fs");
const make_ast = require("../makeAST");
const program = fs.readFileSync("sample_programs/super_program.w", "utf-8");
describe("The ast maker", () => {
    test("Accepts the super program", () => {
        expect(make_ast(program)).toBeDefined()
    });
});
