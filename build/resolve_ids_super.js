const make_ast = require("../src/ast/make_AST");
const fs = require("fs");
const resolve_ids = require("../src/semantics/resolve_context");
const ast = make_ast(fs.readFileSync("sample_programs/super_program.w","utf-8"));
resolve_ids(ast)
