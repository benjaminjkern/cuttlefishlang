// these only work on string sets but this is great for now

const isSet = (object) => {
    return typeof object === "object" && !Array.isArray(object);
};

export const makeSet = (list) => {
    if (isSet(list)) return list;
    return list.reduce((p, c) => ({ ...p, [c]: true }), {});
};

const setFunc =
    (func) =>
    (...args) => {
        return func(...args.map(makeSet));
    };

export const union = setFunc((A, ...B) => {
    if (B.length === 0) return A;
    return union(
        makeSet([...Object.keys(A), ...Object.keys(B[0])]),
        ...B.slice(1)
    );
});

export const intersect = setFunc((A, ...B) => {
    if (B.length === 0) return A;
    return intersect(
        makeSet(Object.keys(A).filter((key) => B[0][key])),
        ...B.slice(1)
    );
});

export const subtract = setFunc((A, B) => {
    return makeSet(Object.keys(A).filter((key) => !B[key]));
});

export const equals = setFunc((A, B) => {
    return Object.keys(intersect(A, B)).length === Object.keys(A).length;
});
