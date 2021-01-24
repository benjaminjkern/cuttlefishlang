const baseGrammar = require('./base_grammar');
const tokenizeIndents = require('./tokenize_indents');
const fs = require('fs');

const checkSyntax = text => baseGrammar.match(tokenizeIndents(text));

module.exports = checkSyntax;

if (module.parent === null) {
    if (process.argv.length >= 3) {
        if (process.argv[2].endsWith(".w")) {
            console.log(module.exports(fs.readFileSync(`./${process.argv[2]}`, 'utf8')).message);
        } else {
            console.log(module.exports(process.argv.slice(2).join(" ")).message);
        }
    } else {
        console.log("Please include a script or example text");
    }
}