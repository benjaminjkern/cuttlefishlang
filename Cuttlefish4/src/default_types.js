const TYPES = {
    Object: {
        subtypes: ["Method", "Collection", "Primitive"]
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
    String: {
        subtypes: ["Primitive"],
    },
    Primitive: {
        subtypes: ["Num", "Bool"],
    },
    Num: {
        subtypes: ["Real", "Imaginary"]
    },
    Real: {
        subtypes: ["Int"]
    },
}

const matchType = (toCheck, type, seen = {}) => {
    if (!toCheck.ObjectType) throw `${toCheck} does not have a type!`;
    if (toCheck.ObjectType === type) return true;
    if (seen[type] || !TYPES[type] || !TYPES[type].subtypes) return false;
    seen[type] = true;
    return TYPES[type].subtypes.some(subtype => matchType(toCheck, subtype));
}

const smallestCommonType = (A, B, topType = "Object", seen = {}) => {
    if (!A.ObjectType) throw `${A} does not have a type!`;
    if (!B.ObjectType) throw `${B} does not have a type!`;
    if (A.ObjectType === B.ObjectType) return A.ObjectType;

    if (seen[topType] || !matchType(A, topType) || !matchType(B, topType)) return null;
    seen[topType] = true;

    if (!TYPES[topType] || !TYPES[topType].subtypes) return topType;

    for (const subtype of TYPES[topType].subtypes) {
        const matches = smallestCommonType(A, B, subtype);
        if (matches) return matches;
    }
    return topType;
}

module.exports = { TYPES, matchType, smallestCommonType };