const { deepEquals, deepNotEquals, hash, contains, toString } = require('./utils');

const { matchType, smallestCommonType } = require('./default_types');

const PATTERNS = {
    Bool: [{
            pattern: [{ type: "Object" }, "===", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: (left.value !== undefined && right.value !== undefined && left.value === right.value) || (left.pointer !== undefined && right.pointer !== undefined && left.pointer === right.pointer) })
        },
        {
            pattern: [{ type: "Object" }, "==", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: deepEquals(left, right) }),
        },
        {
            pattern: [{ type: "Object" }, "!==", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: (left.value === undefined || right.value === undefined || left.value !== right.value) && (left.pointer === undefined || right.pointer === undefined || left.pointer !== right.pointer) })
        },
        {
            pattern: [{ type: "Object" }, "!=", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: deepNotEquals(left, right) }),
        },
        {
            pattern: [{ type: "Real" }, ">=", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value >= right.value })
        },
        {
            pattern: [{ type: "Real" }, "<=", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value <= right.value })
        },
        {
            pattern: [{ type: "Real" }, ">", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value > right.value })
        },
        {
            pattern: [{ type: "Real" }, "<", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value < right.value })
        },
        {
            pattern: [{ type: "Real" }, "%=", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value % right.value === 0 })
        },
        {
            pattern: [{ type: "Real" }, "%!=", { type: "Real" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value % right.value !== 0 })
        },
        {
            pattern: [{ type: "Bool" }, "||", { type: "Bool" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value || right.value })
        },
        {
            pattern: [{ type: "Bool" }, "or", { type: "Bool" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value || right.value })
        },
        {
            pattern: [{ type: "Bool" }, "&&", { type: "Bool" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value && right.value })
        },
        {
            pattern: [{ type: "Bool" }, "and", { type: "Bool" }],
            evaluate: (left, right) => ({ ObjectType: "Bool", value: left.value && right.value })
        },
        { pattern: [{ type: "Object" }, "in", { type: "String" }], evaluate: (left, right) => ({ ObjectType: "Bool", value: right.value.includes(left.value) }) },
        { pattern: [{ type: "Object" }, "in", { type: "List" }], evaluate: (left, right) => ({ ObjectType: "Bool", value: contains(left, right.values) }) },
        {
            pattern: [{ type: "Object" }, "in", { type: "Iteratable" }],
            evaluate: (left, right) => {
                while (right.hasNext) {
                    if (deepEquals(left, right.next().current)) {
                        return { ObjectType: "Bool", value: true };
                    }
                }
                return { ObjectType: "Bool", value: false };
            }
        },
        { pattern: [{ type: "Object" }, "in", { type: "Set" }], evaluate: (left, right) => ({ ObjectType: "Bool", value: !!right.values[hash(left)] }) },
        { pattern: [{ type: "Object" }, "in", { type: "Testable" }], evaluate: (left, right) => ({ ObjectType: "Bool", value: right.test(left) }) },
        { returnType: "Bool", pattern: ["!", { type: "Bool" }], evaluate: (val) => ({ ObjectType: "Bool", value: !val.value }) },
    ],
    Num: [
        { returnType: "Num", pattern: [{ type: "Num" }, "+", { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value + right.value }) },
        { returnType: "Num", pattern: [{ type: "Num" }, "-", { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value - right.value }) },
        { returnType: "Num", pattern: [{ type: "Num" }, "*", { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value * right.value }) },
        { returnType: "Num", pattern: [{ type: "Num" }, "/", { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value / right.value }) },
        { returnType: "Num", pattern: [{ type: "Num" }, "^", { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value ** right.value }) },
        { returnType: "Num", pattern: [{ type: "Num" }, { type: "Num" }], evaluate: (left, right) => ({ ObjectType: smallestCommonType(left, right), value: left.value * right.value }) },
        { returnType: "Num", pattern: ["-", { type: "Num" }], evaluate: (val) => ({ ObjectType: val.ObjectType, value: -val.value }) },
    ],
    Int: [
        { returnType: "Int", pattern: [{ type: "Num" }, "//", { type: "Int" }], evaluate: (left, right) => ({ ObjectType: "Int", value: Math.floor(left.value / right.value) }) },
    ],
    Set: [{
            pattern: [{ type: "Set" }, "|", { type: "Set" }],
            evaluate: (left, right) => ({ ObjectType: "Set", values: Object.keys(right.values).reduce((p, c) => ({...p, [c]: right.values[c] }), left.values) })
        },
        {
            pattern: [{ type: "Set" }, "|", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Set", values: {...left.values, [hash(right)]: right } })
        },
        {
            pattern: [{ type: "Object" }, "|", { type: "Set" }],
            evaluate: (left, right) => ({ ObjectType: "Set", values: {...right.values, [hash(left)]: left } })
        },
        {
            pattern: [{ type: "Set" }, "&", { type: "Set" }],
            evaluate: (left, right) => ({
                ObjectType: "Set",
                values: Object.keys(right.values).reduce((p, c) => left.values[c] ? {...p, [c]: right.values[c] } : p, {})
            })
        },
        {
            pattern: [{ type: "Set" }, "-", { type: "Set" }],
            evaluate: (left, right) => ({ ObjectType: "Set", values: Object.keys(left.values).reduce((p, c) => right.values[c] ? p : {...p, [c]: left.values[c] }, {}) })
        },
        {
            pattern: [{ type: "Set" }, "-", { type: "Object" }],
            evaluate: (left, right) => ({ ObjectType: "Set", values: Object.keys(left.values).reduce((p, c) => c === hash(right) ? p : {...p, [c]: left.values[c] }, {}) })
        },
    ],
    Testable: [{
            pattern: [{ type: "Testable" }, "|", { type: "Testable" }],
            evaluate: (left, right) => ({ ObjectType: "Testable", test: (obj) => left.test(obj) || right.test(obj) })
        },
        {
            pattern: [{ type: "Testable" }, "&", { type: "Testable" }],
            evaluate: (left, right) => ({ ObjectType: "Testable", test: (obj) => left.test(obj) && right.test(obj) })
        },
        {
            pattern: [{ type: "Testable" }, "-", { type: "Testable" }],
            evaluate: (left, right) => ({ ObjectType: "Testable", test: (obj) => left.test(obj) && !right.test(obj) })
        },
    ],
    String: [{
        pattern: [{ type: "String" }, "++", { type: "String" }],
        evaluate: (left, right) =>
            ({ ObjectType: "String", value: toString(left) + toString(right) })
    }, ],
    List: [{
            pattern: [{ type: "List" }, "++", { type: "List" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "List",
                    values: [...left.values, ...right.values]
                })
        },
        {
            pattern: [{ type: "List" }, "++", { type: "Object" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "List",
                    values: [...left.values, right]
                })
        }, {
            pattern: [{ type: "Object" }, "++", { type: "List" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "List",
                    values: [left, ...right.values]
                })
        },
    ],
    Iterable: [{
            pattern: [{ type: "Iterable" }, "++", { type: "Iterable" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "Iterable",
                    next() {
                        const obj = left.hasNext ? left.next() : right.next();
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    current: left.current,
                    hasNext: left.hasNext
                })
        },
        {
            pattern: [{ type: "Iterable" }, "++", { type: "Object" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "Iterable",
                    next() {
                        const obj = left.hasNext ? left.next() : { current: right, hasNext: false };
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    current: left.current,
                    hasNext: left.hasNext
                })
        },
        {
            pattern: [{ type: "Object" }, "++", { type: "Iterable" }],
            evaluate: (left, right) =>
                ({
                    ObjectType: "Iterable",
                    usedUp: false,
                    next() {
                        const obj = this.usedUp ? { current: left, hasNext: right.hasNext } : right.next();
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    hasNext: right.hasNext
                })
        },

        { pattern: [{ type: "Iterable" }, "|>", { type: "Method" }] },
        { pattern: [{ type: "Iterable" }, { type: "Iterable" }] },
    ],
    Tuple: [
        // NOT SO SURE ABOUT THIS
        { pattern: [{ type: "Object" }, "**", { type: "Int" }] },
        { pattern: [{ type: "Object" }, "**", { type: "Tuple" }] },
    ],
    Object: [
        { pattern: [{ type: "Object" }, "|>", { type: "Method" }] },
        { pattern: [{ type: "Method" }, { type: "Object" }] },
        {
            pattern: [{ type: "Bool" }, "?", { type: "Object" }, ":", { type: "Object" }],
            evaluate: (test, ifTrue, ifFalse) => test.value ? ifTrue : ifFalse
        }
    ],
}

const parsePattern = (expression, expectedType) => {
    // BIG PROJECT
}

module.exports = PATTERNS;