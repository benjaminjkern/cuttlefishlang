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

const isOfType = (toCheck, type, seen = {}) => {
    if (!toCheck.type) throw `${toCheck} does not have a type!`;
    if (toCheck.type === type) return true;
    if (seen[type] || !TYPES[type] || !TYPES[type].subtypes) return false;
    seen[type] = true;
    return TYPES[type].subtypes.some(subtype => isOfType(toCheck, subtype));
}

const smallestCommonType = (A, B, topType = "Object", seen = {}) => {
    if (!A.type) throw `${A} does not have a type!`;
    if (!B.type) throw `${B} does not have a type!`;
    if (A.type === B.type) return A.type;

    if (seen[topType] || !isOfType(A, topType) || !isOfType(B, topType)) return null;
    seen[topType] = true;

    if (!TYPES[topType] || !TYPES[topType].subtypes) return topType;

    for (const subtype of TYPES[topType].subtypes) {
        const matches = smallestCommonType(A, B, subtype);
        if (matches) return matches;
    }
    return topType;
}

const findSuperTypes = (nodeType) => Object.keys(TYPES).reduce((p, type) => TYPES[type].subtypes && TYPES[type].subtypes.includes(nodeType) ? [...p, type] : p, []);

const readjustNum = (num) => {
    if (num === Math.floor(num)) return { type: "Int", value: num };
    return { type: "Real", value: num };
}

const allSubTypes = (nodeType, seen = {}) => {
    if (!seen[nodeType]) seen[nodeType] = true;
    if (TYPES[nodeType] && TYPES[nodeType].subtypes) TYPES[nodeType].subtypes.forEach(subtype => allSubTypes(subtype, seen));
    return Object.keys(seen);
};

module.exports = { TYPES, isOfType, smallestCommonType, findSuperTypes, readjustNum };