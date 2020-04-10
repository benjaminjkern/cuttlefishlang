const fs = require("fs");
const tokenize_indents = require("../src/grammar/tokenize_indents.js");
fs.writeFileSync("./sample_programs/super_program.w.tokenized",tokenize_indents(fs.readFileSync("./sample_programs/super_program.w","utf-8")));

