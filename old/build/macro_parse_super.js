const parse_macros = require("../src/grammar/macro_parser");
const fs = require('fs');
const util = require('util');
fs.writeFileSync("sample_programs/compilation_steps/super_program.w.macrocontext",util.inspect(parse_macros("sample_programs/super_program.w"),false,null),"utf-8");

