const fs = require('fs');
const ohm = require('ohm-js');

const baseGrammar = ohm.grammar(fs.readFileSync('src/grammar/cuttlefish.ohm'));
const tokenizeIndents = require('./tokenize_indents');

module.exports = text => baseGrammar.match(tokenizeIndents(text)).succeeded();