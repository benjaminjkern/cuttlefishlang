const hashSalt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER * 2 - Number.MAX_SAFE_INTEGER);

const hash = (obj) => strHash(objHash(obj));

const strHash = (str) => {
    let h = hashSalt;
    let c = 0;

    while (c < str.length) {
        h = ((h << 5) + h) + str.charCodeAt(c); /* hash * 33 + c */
        c++;
    }

    return h;
}
const objHash = (obj) => {
    if (typeof obj !== 'object') return obj + '';
    if (obj.length !== undefined) return "[" + obj.map(v => hash(v)).join(',') + "]";
    return "{" + Object.keys(obj).map(v => v + ':' + hash(obj[v])).join(',') + "}";
};

const deepEquals = (A, B) => {
    if (typeof A !== typeof B) return false;
    if (typeof A !== 'object') return A === B;
    if (A.length !== undefined) return B.length !== undefined && A.length === B.length && A.every((v, i) => deepEquals(v, B[i]));
    const Akeys = Object.keys(A);
    return Akeys.length === Object.keys(B).length && Akeys.every(key => B[key] !== undefined && deepEquals(A[key], B[key]));
}

const deepCopy = (obj) => {
    if (typeof obj !== 'object') return obj;
    if (obj.length) return obj.map(v => deepCopy(v));
    return Object.keys(obj).reduce((p, c) => ({...p, [c]: deepCopy(obj[c]) }), {});
};

const contains = (inside, out) => out.some(v => deepEquals(inside, v));

const makeIterator = (list) => ({
    ObjectType: "Iterator",
    next() {
        if (!this.hasNext) {
            console.log("Does not have a next!");
            return;
        }
        this.i++;
        this.current = this.values[this.i];
        this.hasNext = this.values.length > this.i + 1;
        return { current: this.current, hasNext: this.hasNext };
    },
    i: -1,
    values: list.values, // not sure if I want to deepcopy this
    hasNext: list.values.length > 0
});

const inspect = x => require('util').inspect(x, false, null, false);

module.exports = { hash, deepCopy, deepEquals, contains, makeIterator, inspect }