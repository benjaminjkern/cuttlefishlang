const make_ast = require("../src/ast/makeAST");
const fs = require("fs");
fs.writeFileSync("sample_programs/compilation_steps/super_program.w.ast",make_ast(fs.readFileSync("sample_programs/super_program.w","utf-8")).toString());
