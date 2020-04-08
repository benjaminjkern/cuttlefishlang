const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path');
module.exports = ohm.grammar(fs.readFileSync(path.resolve(__dirname,'cuttlefish.ohm')))
