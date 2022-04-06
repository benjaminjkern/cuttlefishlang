/*
module.exports = {
    Bool: [{
            pattern: [{ type: "Object" }, "===", { type: "Object" }],
            evaluate: (left, right) => newObject((left.value !== undefined && right.value !== undefined && left.value === right.value) || (left.pointer !== undefined && right.pointer !== undefined && left.pointer === right.pointer)),
        },
        {
            pattern: [{ type: "Object" }, "==", { type: "Object" }],
            evaluate: (left, right) => newObject(deepEquals(left, right)),
        },
        {
            pattern: [{ type: "Object" }, "!==", { type: "Object" }],
            evaluate: (left, right) => newObject((left.value === undefined || right.value === undefined || left.value !== right.value) && (left.pointer === undefined || right.pointer === undefined || left.pointer !== right.pointer)),
        },
        {
            pattern: [{ type: "Object" }, "!=", { type: "Object" }],
            evaluate: (left, right) => newObject(!deepEquals(left, right)),
        },
        {
            pattern: [{ type: "Real" }, ">=", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value >= right.value),
        },
        {
            pattern: [{ type: "Real" }, "<=", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value <= right.value),
        },
        {
            pattern: [{ type: "Real" }, ">", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value > right.value),
        },
        {
            pattern: [{ type: "Real" }, "<", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value < right.value),
        },
        {
            pattern: [{ type: "Real" }, "%=", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value % right.value === 0),
        },
        {
            pattern: [{ type: "Real" }, "%!=", { type: "Real" }],
            evaluate: (left, right) => newObject(left.value % right.value !== 0),
        },
        {
            pattern: [{ type: "Bool" }, "||", { type: "Bool" }],
            evaluate: (left, right) => newObject(left.value || right.value),
        },
        {
            pattern: [{ type: "Bool" }, "or", { type: "Bool" }],
            evaluate: (left, right) => newObject(left.value || right.value),
        },
        {
            pattern: [{ type: "Bool" }, "&&", { type: "Bool" }],
            evaluate: (left, right) => newObject(left.value && right.value),
        },
        {
            pattern: [{ type: "Bool" }, "and", { type: "Bool" }],
            evaluate: (left, right) => newObject(left.value && right.value),
        },
        { pattern: [{ type: "Object" }, "in", { type: "String" }], evaluate: (left, right) => newObject(right.value.includes(left.value)) },
        { pattern: [{ type: "Object" }, "in", { type: "List" }], evaluate: (left, right) => newObject(contains(left, right.values)) },
        {
            pattern: [{ type: "Object" }, "in", { type: "Iterable" }],
            evaluate: (left, right) => {
                while (right.hasNext) {
                    if (deepEquals(left, right.next().current)) {
                        return newObject(true);
                    }
                }
                return newObject(false);
            }
        },
        { pattern: [{ type: "Object" }, "in", { type: "Set" }], evaluate: (left, right) => newObject(!!right.values[hash(left)]) },
        { pattern: [{ type: "Object" }, "in", { type: "Testable" }], evaluate: (left, right) => newObject(right.test(left)) },
        { pattern: ["!", { type: "Bool" }], evaluate: (val) => newObject(!val.value) },
    ],
    Real: [
        { pattern: [{ type: "Real" }, "+", { type: "Real" }], evaluate: (left, right) => newObject(left.value + right.value) },
        { pattern: [{ type: "Real" }, "-", { type: "Real" }], evaluate: (left, right) => newObject(left.value - right.value) },
        { pattern: [{ type: "Real" }, "*", { type: "Real" }], evaluate: (left, right) => newObject(left.value * right.value) },
        { pattern: [{ type: "Real" }, "/", { type: "Real" }], evaluate: (left, right) => newObject(left.value / right.value) },
        { pattern: [{ type: "Real" }, "%", { type: "Real" }], evaluate: (left, right) => newObject(left.value % right.value) },
        { pattern: [{ type: "Real" }, "^", { type: "Real" }], evaluate: (left, right) => newObject(left.value ** right.value) },
        { pattern: ["-", { type: "Real" }], evaluate: (val) => readjustNum(-val.value) }, // might be redundant to do the readjustNum here
        // { pattern: [{ type: "Num" }, { type: "Num" }], evaluate: (left, right) => readjustNum(left.value * right.value) },
    ],
    Int: [
        { pattern: [{ type: "Real" }, "//", { type: "Real" }], evaluate: (left, right) => ({ type: "Int", value: Math.floor(left.value / right.value) }) },
    ],
    Set: [{
            pattern: [{ type: "Set" }, "|", { type: "Set" }],
            evaluate: (left, right) => {
                return { type: "Set", values: Object.keys(right.values).reduce((p, c) => ({...p, [c]: right.values[c] }), left.values) }
            }
        },
        {
            pattern: [{ type: "Set" }, "|", { type: "Object" }],
            evaluate: (left, right) => ({ type: "Set", values: {...left.values, [hash(right)]: right } })
        },
        {
            pattern: [{ type: "Object" }, "|", { type: "Set" }],
            evaluate: (left, right) => ({ type: "Set", values: {...right.values, [hash(left)]: left } })
        },
        {
            pattern: [{ type: "Set" }, "&", { type: "Set" }],
            evaluate: (left, right) => ({
                type: "Set",
                values: Object.keys(right.values).reduce((p, c) => left.values[c] ? {...p, [c]: right.values[c] } : p, {})
            })
        },
        {
            pattern: [{ type: "Set" }, "-", { type: "Set" }],
            evaluate: (left, right) => ({ type: "Set", values: Object.keys(left.values).reduce((p, c) => right.values[c] ? p : {...p, [c]: left.values[c] }, {}) })
        },
        {
            pattern: [{ type: "Set" }, "-", { type: "Object" }],
            evaluate: (left, right) => ({ type: "Set", values: Object.keys(left.values).reduce((p, c) => c === hash(right) ? p : {...p, [c]: left.values[c] }, {}) })
        },
    ],
    Testable: [{
            pattern: [{ type: "Testable" }, "|", { type: "Testable" }],
            evaluate: (left, right) => ({ type: "Testable", test: (obj) => left.test(obj) || right.test(obj) })
        },
        {
            pattern: [{ type: "Testable" }, "&", { type: "Testable" }],
            evaluate: (left, right) => ({ type: "Testable", test: (obj) => left.test(obj) && right.test(obj) })
        },
        {
            pattern: [{ type: "Testable" }, "-", { type: "Testable" }],
            evaluate: (left, right) => ({ type: "Testable", test: (obj) => left.test(obj) && !right.test(obj) })
        },
    ],
    String: [{
        pattern: [{ type: "String" }, "++", { type: "String" }],
        evaluate: (left, right) =>
            ({ type: "String", value: left.value + right.value })
    }, ],
    List: [{
            pattern: [{ type: "List" }, "++", { type: "List" }],
            evaluate: (left, right) =>
                ({
                    type: "List",
                    values: [...left.values, ...right.values]
                })
        },
        {
            pattern: [{ type: "List" }, "++", { type: "Object" }],
            condition: (left, right) => !isOfType(right, "Iterable"),
            evaluate: (left, right) =>
                ({
                    type: "List",
                    values: [...left.values, right]
                })
        }, {
            pattern: [{ type: "Object" }, "++", { type: "List" }],
            condition: (left, right) => !isOfType(left, "Iterable"),
            evaluate: (left, right) =>
                ({
                    type: "List",
                    values: [left, ...right.values]
                })
        },
    ],
    Iterable: [{
            pattern: [{ type: "Iterable" }, "++", { type: "Iterable" }],
            evaluate: (left, right) => {
                const leftIt = makeIterator(left);
                const rightIt = makeIterator(right);
                return {
                    type: "Iterable",
                    next() {
                        const obj = leftIt.hasNext ? leftIt.next() : rightIt.next();
                        this.current = obj.current;
                        this.hasNext = rightIt.hasNext;
                        return obj;
                    },
                    current: leftIt.current,
                    hasNext: rightIt.hasNext
                }
            }
        },
        {
            pattern: [{ type: "Iterable" }, "++", { type: "Object" }],
            evaluate: (left, right) => {
                const it = makeIterator(left);
                return {
                    type: "Iterable",
                    next() {
                        const obj = it.hasNext ? left.next() : { current: right, hasNext: false };
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    current: it.current,
                    hasNext: true
                }
            }
        },
        {
            pattern: [{ type: "Object" }, "++", { type: "Iterable" }],
            evaluate: (left, right) => {
                const it = makeIterator(right);
                return {
                    type: "Iterable",
                    usedUp: false,
                    next() {
                        const obj = this.usedUp ? { current: left, hasNext: it.hasNext } : it.next();
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    hasNext: true,
                }
            }
        },

        { pattern: [{ type: "Iterable" }, "|>", { type: "Function" }] },
        {
            pattern: [{ type: "Iterable" }, { type: "Iterable" }],
            condition: (left, right) => {
                const rightCopy = deepCopy(right);
                while (rightCopy.hasNext) {
                    if (!isOfType(rightCopy.next().current, "Int")) return false;
                }
                return true;
            },
            evaluate: (left, right) => {
                const leftCopy = deepCopy(left);
                const rightCopy = deepCopy(right);
                const returnIterable = {
                    type: "Iterable",
                    next() {
                        const obj = it.hasNext ? left.next() : { current: right, hasNext: false };
                        this.current = obj.current;
                        this.hasNext = obj.hasNext;
                        return obj;
                    },
                    current: it.current,
                    hasNext: rightCopy.hasNext // fuck
                }
            }
        },
    ],
    Tuple: [
        // NOT SO SURE ABOUT THIS
        { pattern: [{ type: "Object" }, "**", { type: "Int" }] },
        { pattern: [{ type: "Object" }, "**", { type: "Tuple" }] },
    ],
    Object: [
        { pattern: [{ type: "Object" }, "|>", { type: "Method" }] },
        { pattern: [{ type: "Method" }, { type: "Object" }], },
        {
            pattern: [{ type: "Bool" }, "?", { type: "Object" }, ":", { type: "Object" }],
            evaluate: (test, ifTrue, ifFalse) => test.value ? ifTrue : ifFalse
        },
    ],
    Type: [
        { pattern: [{ type: "List" }], condition: (val) => val.values.length === 1 && isOfType(val.values[0], "Type") }
    ]
}*/