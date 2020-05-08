const fs = require("fs");

const matchSyntax = require("./src/grammar/syntax_checker");
const tokenizeIndents = require("./src/grammar/tokenize_indents");
const parseMacro = require("./src/grammar/macro_parser");
const makeAST = require("./src/ast/make_AST");
//const analyzeSemantics = require("./src/semantics/analyze");
const generateJS = require("./src/generation/generateJS");
const { inspect } = require("util");

const program = fs.readFileSync("sample_programs/super_program.w", "utf-8");

const program2 = "x = fn: Num a, Num b | a - b > 12 -> a + b";

console.log(inspect(makeAST(program), false, null, false));
//console.log(generateJS(program));