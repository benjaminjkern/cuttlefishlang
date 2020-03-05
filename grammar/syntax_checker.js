const fs = require('fs');
const ohm = require('ohm-js');
const path = require('path');
const grammar = ohm.grammar(fs.readFileSync(path.resolve(__dirname,'grammar/cuttlefish.ohm')));

module.exports = text => grammar.match(text).succeeded();


