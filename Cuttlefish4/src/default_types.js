const TYPES = {
    Object: {
        subtypes: ["Primitive", "Method", "Collection"]
    },
    Collection: {
        subtypes: ["Testable", "Iterable", "Tuple"]
    },
    Iterable: {
        subtypes: ["List", "String"]
    },
    Testable: {
        subtypes: ["Set", "Type", "Dictionary"]
    },
    Method: {
        subtypes: ["Function", "Process"],
        generics: ["input", "output"]
    },
    Primitive: {
        subtypes: ["Num", "Bool"],
    },
    Num: {
        subtypes: ["Real"]
    },
    Real: {
        subtypes: ["Int"]
    },
    Int: {
        subtypes: ["BigInt"]
    }
}

const { allSubTypes } = require('./typeUtils');

Object.keys(TYPES).forEach(type => allSubTypes(type).forEach(subtype => { TYPES[subtype] = TYPES[subtype] || {} }))

module.exports = TYPES;