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

        indents = indents.filter(num => num <= spaces)
        return "⇦\n".repeat(num_indents - indents.length + 1) + line;
    }).join("\n") + "\n⇦".repeat(indents.length - 1);
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

