const { deepEquals, hash, contains, toString, makeIterator, deepCopy } = require('./utils');

const { readjustNum, isOfType, allSubTypes } = require('./default_types');

const { newObject } = require("./heap");

const PATTERNS = [{
        pattern: [{ type: "Object" }, "===", { type: "Object" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject((left.value !== undefined && right.value !== undefined && left.value === right.value) || (left.pointer !== undefined && right.pointer !== undefined && left.pointer === right.pointer))
    },
    {
        pattern: [{ type: "Object" }, "==", { type: "Object" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(deepEquals(left, right)),
    },
    {
        pattern: [{ type: "Object" }, "!==", { type: "Object" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject((left.value === undefined || right.value === undefined || left.value !== right.value) && (left.pointer === undefined || right.pointer === undefined || left.pointer !== right.pointer)),
    },
    {
        pattern: [{ type: "Object" }, "!=", { type: "Object" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(!deepEquals(left, right)),
    },
    {
        pattern: [{ type: "Real" }, ">=", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value >= right.value),
    },
    {
        pattern: [{ type: "Real" }, "<=", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value <= right.value),
    },
    {
        pattern: [{ type: "Real" }, ">", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value > right.value),
    },
    {
        pattern: [{ type: "Real" }, "<", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value < right.value),
    },
    {
        pattern: [{ type: "Real" }, "%=", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value % right.value === 0),
    },
    {
        pattern: [{ type: "Real" }, "%!=", { type: "Real" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value % right.value !== 0),
    },
    {
        pattern: [{ type: "Bool" }, "||", { type: "Bool" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value || right.value),
    },
    {
        pattern: [{ type: "Bool" }, "or", { type: "Bool" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value || right.value),
    },
    {
        pattern: [{ type: "Bool" }, "&&", { type: "Bool" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value && right.value),
    },
    {
        pattern: [{ type: "Bool" }, "and", { type: "Bool" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(left.value && right.value),
    },
    {
        pattern: [{ type: "String" }, "in", { type: "String" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(right.value.includes(left.value))
    },
    {
        pattern: [{ type: "Object" }, "in", { type: "List" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(contains(left, right.values))
    },
    {
        pattern: [{ type: "Object" }, "in", { type: "Iterable" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => {
            while (right.hasNext) {
                if (deepEquals(left, right.next().current)) {
                    return newObject(true);
                }
            }
            return newObject(false);
        }
    },
    {
        pattern: [{ type: "Object" }, "in", { type: "Set" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(!!right.values[hash(left)])
    },
    {
        pattern: [{ type: "Object" }, "in", { type: "Testable" }],
        returnTypes: ["Bool"],
        evaluate: (left, right) => newObject(right.test(left))
    },
    {
        pattern: ["!", { type: "Bool" }],
        returnTypes: ["Bool"],
        evaluate: (val) => newObject(!val.value)
    },
    {
        pattern: [{ type: "Num" }, "+", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value + right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            return readjustNum([left.value[0] + right.value[0], left.value[1] + right.value[1]]);
        }
    },
    {
        pattern: [{ type: "Num" }, "-", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value - right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            return readjustNum([left.value[0] - right.value[0], left.value[1] - right.value[1]]);
        }
    },
    {
        pattern: [{ type: "Num" }, "*", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value * right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            return readjustNum([left.value[0] * right.value[0] - left.value[1] * right.value[1], left.value[0] * right.value[1] + left.value[1] * right.value[0]]);
        }
    },
    {
        pattern: [{ type: "Num" }, "/", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value / right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            const mag = right.value[0] ** 2 + right.value[1] ** 2;
            return readjustNum([(left.value[0] * right.value[0] + left.value[1] * right.value[1]) / mag, (left.value[1] * right.value[0] - left.value[0] * right.value[1]) / mag]);
        }
    },
    {
        pattern: [{ type: "Num" }, "^", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value ** right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            const A = 0.5 * Math.log(left.value[0] ** 2 + left.value[1] ** 2);
            const T = Math.atan2(left.value[1], left.value[0]);
            const magnitude = Math.exp(A * right.value[0] - T * right.value[1]);
            const angle = T * right.value[0] + A * right.value[1];
            return readjustNum({ value: [magnitude * Math.cos(angle), magnitude * Math.sin(angle)] });
        }
    },
    {
        pattern: ["-", { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (val) => {
            if (val.type === "Num") {
                return { type: "Num", value: val.value.map(a => -a) };
            } else if (val.type === "Imaginary") {
                return { type: "Imaginary", value: -val.value };
            }
            return readjustNum(-val.value);
        }
    },

    // TODO: Multiplication
    /*
    {
        pattern: [{ type: "Num" }, { type: "Num" }],
        returnTypes: allSubTypes("Num"),
        evaluate: (left, right) => {
            if (isOfType(left, "Real") && isOfType(right, "Real")) return readjustNum(left.value * right.value);
            if (left.type === "Imaginary") left = { type: "Num", value: [0, left.value] };
            if (right.type === "Imaginary") right = { type: "Num", value: [0, right.value] };
            return readjustNum([left.value[0] * right.value[0] - left.value[1] * right.value[1], left.value[0] * right.value[1] + left.value[1] * right.value[0]]);
        }
    },*/
    { pattern: [{ type: "Real" }, "%", { type: "Real" }], returnTypes: allSubTypes("Real"), evaluate: (left, right) => newObject(left.value % right.value) },
    { pattern: [{ type: "Real" }, "//", { type: "Real" }], returnTypes: ["Int"], evaluate: (left, right) => ({ type: "Int", value: Math.floor(left.value / right.value) }) },
    {
        pattern: [{ type: "Set" }, "|", { type: "Set" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject(Object.keys(right.values).reduce((p, c) => ({...p, [c]: right.values[c] }), left.values), "Set"),
    }, {
        pattern: [{ type: "Set" }, "|", { type: "Object" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject({...left.values, [hash(right)]: right }, "Set"),
    }, {
        pattern: [{ type: "Object" }, "|", { type: "Set" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject({...right.values, [hash(left)]: left }, "Set"),
    }, {
        pattern: [{ type: "Set" }, "&", { type: "Set" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject(Object.keys(right.values).reduce((p, c) => left.values[c] ? {...p, [c]: right.values[c] } : p, {}), "Set"),
    }, {
        pattern: [{ type: "Set" }, "-", { type: "Set" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject(Object.keys(left.values).reduce((p, c) => right.values[c] ? p : {...p, [c]: left.values[c] }, {}), "Set"),
    }, {
        pattern: [{ type: "Set" }, "-", { type: "Object" }],
        returnTypes: ["Set"],
        evaluate: (left, right) => newObject(Object.keys(left.values).reduce((p, c) => c === hash(right) ? p : {...p, [c]: left.values[c] }, {}), "Set"),
    },
    {
        pattern: [{ type: "Object" }, "++", { type: "String" }],
        returnTypes: ["String"],
        evaluate: (left, right) => newObject(toString(left.value) + right.value),
    },
    {
        pattern: [{ type: "Testable" }, "|", { type: "Testable" }],
        returnTypes: ["Testable"],
        evaluate: (left, right) => newObject({ test: (obj) => left.test(obj) || right.test(obj) }, "Testable"),
    },
    {
        pattern: [{ type: "Testable" }, "&", { type: "Testable" }],
        returnTypes: ["Testable"],
        evaluate: (left, right) => newObject({ test: (obj) => left.test(obj) && right.test(obj) }, "Testable"),
    },
    {
        pattern: [{ type: "Testable" }, "-", { type: "Testable" }],
        returnTypes: ["Testable"],
        evaluate: (left, right) => newObject({ test: (obj) => left.test(obj) && !right.test(obj) }, "Testable"),
    },
    /*
        Lists
    */
    {
        pattern: [{ type: "List" }, "++", { type: "List" }],
        evaluate: (left, right) => newObject({
            values: [...left.values, ...right.values]
        }, "List")
    },
    {
        pattern: [{ type: "List" }, "++", { type: "Object" }],
        returnTypes: ["List"],
        condition: (left, right) => !isOfType(right, "Iterable"),
        evaluate: (left, right) => newObject({ values: [...left.values, right] }, "List")
    },
    {
        pattern: [{ type: "Object" }, "++", { type: "List" }],
        returnTypes: ["List"],
        condition: (left, right) => !isOfType(left, "Iterable"),
        evaluate: (left, right) =>
            newObject({
                values: [left, ...right.values]
            }, "List")
    },
    /*
        Iterables
    */
    {
        pattern: [{ type: "Iterable" }, "++", { type: "Iterable" }],
        returnTypes: ["Iterable"],
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
        returnTypes: ["Iterable"],
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
    }, {
        pattern: [{ type: "Object" }, "++", { type: "Iterable" }],
        returnTypes: ["Iterable"],
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
    // TODO: FIX
    /*
    { pattern: [{ type: "Iterable" }, "|>", { type: "Function" }] },

    // TODO: FIX / think about
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
    },*/
]