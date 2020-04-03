const fs = require("fs");
const path = require("path");
module.exports = tokenize_indents;

function tokenize_indents(source) {
    let indents = [0];
    return source.split("\n").filter(line => get_indentation(line) !== null).map(line => {
        let spaces = get_indentation(line);
        let num_indents = indents.length - 1;
        let current_indent = indents[num_indents];
        if ([-1, current_indent].includes(spaces)) return line;

        if (spaces > current_indent) {
            indents.push(spaces);
            return "⇨\n" + line;
        }

        console.log(indents);
        indents = indents.filter(num => num <= spaces)
        console.log(indents);
        return "⇦\n".repeat(num_indents - indents.length + 1) + line;
    }).join("\n") + "\n" + "⇦\n".repeat(indents.length - 1);
}

let leading_whitespace = /^\s+/;
let macro_line = /^\s*#!/
let empty_line = /^(\s*|\s*#(?!\/|!).*)$/;

function get_indentation(line) {
    if (macro_line.test(line)) return -1;
    if (empty_line.test(line)) return null;
    let l = line.match(leading_whitespace);
    if (l === null) return 0;
    return l[0].length;
}

if (!module.parent) {
    const tokenizer = require(path.resolve(__dirname, "tokenize_indents.js"));
    const ohm = require("ohm-js");
    const basegrammar = ohm.grammar(
        fs.readFileSync(path.resolve(__dirname, "cuttlefish.ohm"))
    );
    const tokenized = tokenize_indents(
        fs.readFileSync(
            path.resolve(__dirname, "../sample_programs/super_program.w"),
            "utf8"
        )
    );
    console.log(tokenized);
    const match = basegrammar.match(tokenized);
    if (match.failed()) {
        console.log(match.message);
    } else {
        console.log("all dandy");
    }
}