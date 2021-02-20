const VARS = {
    true: { type: "Bool", value: true },
    false: { type: "Bool", value: false }
}

const { TYPES } = require('./default_types');
Object.keys(TYPES).forEach(type => VARS[type] = { type: "Type" });

module.exports = VARS;