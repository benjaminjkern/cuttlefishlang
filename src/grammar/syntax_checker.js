const fs = require('fs');
const ohm = require('ohm-js');
const path = require('path');
const baseGrammar = ohm.grammar(fs.readFileSync(path.resolve(__dirname,'cuttlefish.ohm')));
const tokenizeIndents = require('./tokenize_indents');

module.exports = text => baseGrammar.match(tokenizeIndents(text)).succeeded();
