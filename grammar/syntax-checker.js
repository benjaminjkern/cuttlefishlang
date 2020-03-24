const fs = require('fs');
const ohm = require('ohm-js');

const grammar = ohm.grammar(fs.readFileSync('grammar/cuttlefish.ohm'));

module.exports = text => grammar.match(text).succeeded();
