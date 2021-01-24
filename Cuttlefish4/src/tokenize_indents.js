const fs = require('fs');

const tokenize_indents = source => {
    source = stripCarriageReturns(source);
    let indents = [0];
    return source.split("\n").map(line => {
        let spaces = get_indentation(line);
        if (spaces === null) return null;

        let num_indents = indents.length - 1;
        let current_indent = indents[num_indents];
        if ([-1, current_indent].includes(spaces)) return line;

        if (spaces > current_indent) {
            indents.push(spaces);
            return "→\n" + line;
        }

        indents = indents.filter(num => num <= spaces)
        return "←\n".repeat(num_indents - indents.length + 1) + line;
    }).filter(line => line).join("\n") + "\n←".repeat(indents.length - 1);
}

const leading_whitespace = /^\s+/;
const empty_line = /^(\s*|\s*#(?!(##)).*)$/;

const get_indentation = line => {
    if (empty_line.test(line)) return null;
    let l = line.match(leading_whitespace);
    if (l === null) return 0;
    return l[0].length;
}

const stripCarriageReturns = text => text.replace(/(?<!\n)\r(?!\n)/g, '\n').replace(/\r/g, '');

const preparse = source => stripCarriageReturns(tokenize_indents(source));

module.exports = preparse;

if (module.parent === null) {
    if (process.argv.length >= 3) {
        if (process.argv[2].endsWith(".w")) {
            console.log(module.exports(fs.readFileSync(`./${process.argv[2]}`, 'utf8')));
        } else {
            console.log(module.exports(process.argv.slice(2).join(" ")));
        }
    } else {
        console.log("Please include a script or example text");
    }
}