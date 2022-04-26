const ohm = require('ohm-js');
const fs = require('fs');
module.exports = ohm.grammar(fs.readFileSync('src/grammar/cuttlefish.ohm'))
