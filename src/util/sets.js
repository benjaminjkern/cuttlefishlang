// these only work on string sets but this is great for now

const makeSet = (list) => {
    return list.reduce((p, c) => ({ ...p, [c]: true }), {});
};

const union = (A, ...B) => {
    if (B.length === 0) return A;
    return union(
        makeSet([...Object.keys(A), ...Object.keys(B[0])]),
        ...B.slice(1)
    );
};

const intersect = (A, ...B) => {
    if (B.length === 0) return A;
    return intersect(
        makeSet(Object.keys(A).filter((key) => B[0][key])),
        ...B.slice(1)
    );
};

const subtract = (A, B) => {
    return makeSet(Object.keys(A).filter((key) => !B[key]));
};

module.exports = { makeSet, union, intersect, subtract };
