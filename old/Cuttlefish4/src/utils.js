const hashSalt = Math.floor(Math.random() * 2147483648 * 2 - 2147483648);
// different hash each time cuttlefish runs, I'm honestly not entirely sure this is a great idea but whatever

const hash = (obj) => strHash(objHash(obj));

const strHash = (str) => {
    let h = hashSalt;
    for (let c = 0; c < str.length; c++) {
        h = ((h << 5) + h) + str.charCodeAt(c); /* hash * 33 + c */
    }
    return h;
}

const objHash = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj + '';
    if (obj.length !== undefined) return '[' + obj.map(v => hash(v)).join(',') + ']';
    return '{' + Object.keys(obj).map(v => hash(v) + ':' + hash(obj[v])).join(',') + '}';
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
    if (obj.length !== undefined) return obj.map(v => deepCopy(v));
    return Object.keys(obj).reduce((p, c) => ({...p, [c]: deepCopy(obj[c]) }), {});
};

const contains = (inside, out) => out.some(v => deepEquals(inside, v));

const makeIterator = (list) => {
    if (list.type === 'Iterable') return list;
    if (list.type !== 'List') list.values = [list];
    return {
        ObjectType: "Iterable",
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
    }
};

const print = (object) => {
    switch (object.type) {
        case 'Iterable':
            process.stdout.write("[");
            if (object.hasNext)
                process.stdout.write(" ");
            while (object.hasNext) {
                const item = object.next().current;
                process.stdout.write(toString(item, true));
                if (object.hasNext) process.stdout.write(", ");
            }
            process.stdout.write("]\n");
            break;
        case 'String':
            console.log(object.value);
            break;
        default:
            console.log(toString(object, true));
    }
}

const toString = (object, colors = false, format = true) => {
    if (!format && object.value !== undefined) return object.value;
    switch (object.type) {
        case 'List':
            return '[' + (object.values.length ? object.values.map(val => ' ' + toString(val, colors)).join(',') + ' ' : '') + ']';
        case 'Set':
            return "{" + (Object.keys(object.values).length ? Object.keys(object.values).map(key => ' ' + toString(object.values[key], colors)).join(",") + ' ' : '') + "}";
        default:
            if (object.value !== undefined) {
                if (isOfType(object, "Num") || isOfType(object, "Bool"))
                    return colors ? (object.value + '').yellow : object.value + '';
                if (isOfType(object, "String"))
                    return colors ? ("'" + object.value + "'").green : "'" + object.value + "'";
                return object.value + '';
            }
            if (object.type) return colors ? `[ ${object.type} ]`.blue : `[ ${object.type} ]`;
            return colors ? "[ Untyped Object ]".red : "[ Untyped Object ]";
    }
}

const { isOfType } = require('./default_types');

const inspect = (x, colors = false) => require('util').inspect(x, false, null, colors);

module.exports = { hash, deepCopy, deepEquals, deepNotEquals, contains, makeIterator, inspect, toString, print };