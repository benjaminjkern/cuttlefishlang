const fs = require('fs');
const ohm = require('ohm-js');
const path = require('path');
const baseGrammar = require('./base_grammar');
const tokenizeIndents = require('./tokenize_indents');

module.exports = text => baseGrammar.match(tokenizeIndents(text)).succeeded();
