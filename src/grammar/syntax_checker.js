const fs = require('fs');
const ohm = require('ohm-js');
const baseGrammar = require('./base_grammar');
const tokenizeIndents = require('./tokenize_indents');

module.exports = text => baseGrammar.match(tokenizeIndents(text.replace(/\r\n/g, '\n')));
