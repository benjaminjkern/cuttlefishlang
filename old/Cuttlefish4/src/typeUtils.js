const TYPES = {};

const isOfType = (toCheck, type, seen = {}) => {
    if (typeof type === 'object') type = type.value;
    if (!toCheck.type) throw noTypeError(toCheck);
    if (toCheck.type === type) return true;
    if (seen[type] || !TYPES[type] || !TYPES[type].subtypes) return false;
    seen[type] = true;
    return TYPES[type].subtypes.some(subtype => isOfType(toCheck, subtype));
}

const smallestCommonType = (A, B, topType = "Object", seen = {}) => {
    if (!A.type) throw noTypeError(A);
    if (!B.type) throw noTypeError(B);
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

const noTypeError = (node) => `${node} does not have a type!`;

const findSuperTypes = (nodeType) => Object.keys(TYPES).reduce((p, type) => TYPES[type].subtypes && TYPES[type].subtypes.includes(nodeType) ? [...p, type] : p, []);

const allSubTypes = (nodeType, seen = {}) => {
    if (!seen[nodeType]) seen[nodeType] = true;
    if (TYPES[nodeType] && TYPES[nodeType].subtypes) TYPES[nodeType].subtypes.forEach(subtype => allSubTypes(subtype, seen));
    return Object.keys(seen);
};

const readjustNum = (num) => {
    if (typeof num === 'object') {
        if (num.length === 2) {
            if (num[0] === 0) return { type: "Imaginary", value: num[1] }
            return { type: "Num", value: num };
        }
        throw `Number ${num} not recognized`;
    }
    if (num === Math.floor(num)) return { type: "Int", value: num };
    return { type: "Real", value: num };
}

module.exports = {
    isOfType,
    smallestCommonType,
    findSuperTypes,
    readjustNum,
    allSubTypes
}