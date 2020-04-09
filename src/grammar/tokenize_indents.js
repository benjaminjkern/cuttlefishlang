module.exports = source => {
    return stripCarriageReturns(tokenize_indents(source));
}
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
            return "⇨\n" + line;
        }

        indents = indents.filter(num => num <= spaces)
        return "⇦\n".repeat(num_indents - indents.length + 1) + line;
    }).filter(line => line).join("\n") + "\n⇦".repeat(indents.length - 1);
}

const leading_whitespace = /^\s+/;
const macro_line = /^\s*#!/;
const empty_line = /^(\s*|\s*#(?!\/|!).*)$/;

const get_indentation = line => {
    if (macro_line.test(line)) return -1;
    if (empty_line.test(line)) return null;
    let l = line.match(leading_whitespace);
    if (l === null) return 0;
    return l[0].length;
}

const stripCarriageReturns = text => {
    return text.replace(/\r\n/g,'\n');
}
