const baseGrammar = require('./base_grammar');
const tokenizeIndents = require('./tokenize_indents');

module.exports = text => baseGrammar.match(tokenizeIndents(text));