const TYPES = {
    Object: {
        subtypes: ["Method", "Collection", "Num", "Bool", "Type"]
    },
    Collection: {
        subtypes: ["Testable", "Iterable", "String"]
    },
    Iterable: {
        subtypes: ["List", "DiscreteRange"]
    },
    Testable: {
        subtypes: ["Set", "ContinuousRange"]
    },
    List: {
        generics: ["listType"],
    },
    Set: {
        generics: ["setType"],
    },
    Method: {
        abstract: true,
        subtypes: ["Function", "Process"],
        generics: ["input", "output"]
    },
    Num: {
        subtypes: ["Real", "Imaginary"]
    },
    Real: {
        subtypes: ["Int"]
    },
}

const matchType = (toCheck, type) => {
    if (!toCheck.ObjectType) throw `${toCheck} does not have a type!`;
    if (toCheck.ObjectType === type) return true;
    if (!TYPES[type] || !TYPES[type].subtypes) return false;
    return TYPES[type].subtypes.some(subtype => matchType(toCheck, subtype));
}

module.exports = { TYPES, matchType };