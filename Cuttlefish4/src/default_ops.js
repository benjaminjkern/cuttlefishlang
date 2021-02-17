const { matchType } = require("./default_types");

const { hash, contains, deepEquals, deepCopy } = require("./utils");

const BinaryOpEvals = {
    "===": (left, right) => {

        return { ObjectType: "Bool", value: (left.value !== undefined && right.value !== undefined && left.value === right.value) || (left.pointer !== undefined && right.pointer !== undefined && left.pointer === right.pointer) };
    },
    "==": (left, right) => {
        return { ObjectType: "Bool", value: deepEquals(left, right) };
    },
    ">=": (left, right) => {
        return { ObjectType: "Bool", value: left.value >= right.value };
    },
    "<=": (left, right) => {
        return { ObjectType: "Bool", value: left.value <= right.value };
    },
    ">": (left, right) => {
        return { ObjectType: "Bool", value: left.value > right.value };
    },
    "<": (left, right) => {
        return { ObjectType: "Bool", value: left.value < right.value };
    },
    "%": (left, right) => {
        return { ObjectType: "Num", value: left.value % right.value };
    },
    "^": (left, right) => {
        return { ObjectType: "Num", value: left.value ** right.value };
    },
    "++": (left, right) => {
        if (left.ObjectType === 'String' && right.ObjectType === 'String') {
            return { ObjectType: "String", value: left.value + right.value };
        } else if (left.ObjectType === 'List' && right.ObjectType === 'List') {
            return { ObjectType: "List", values: [...left.values, ...right.values] };
        }
        throw "Type Error";
    },
    "**": (left, right) => {},
    "!=": (left, right) => {},
    "!==": (left, right) => {},
    "%=": (left, right) => {
        return { ObjectType: "Bool", value: left.value % right.value === 0 };
    },
    "%!=": (left, right) => {
        return { ObjectType: "Bool", value: left.value % right.value !== 0 };
    },
    "|>": (left, right, scope) => {
        // return evaluate({ ASTType: "Application", func: right, input: [left] }, scope);
    },
    "*": (left, right) => {
        return { ObjectType: "Num", value: left.value * right.value };
    },
    "//": (left, right) => {
        return { ObjectType: "Int", value: Math.floor(left.value / right.value) };
    },
    "/": (left, right) => {
        return { ObjectType: "Num", value: left.value / right.value };
    },
    "+": (left, right) => {
        return { ObjectType: "Num", value: left.value + right.value };
    },
    "-": (left, right) => {
        if (matchType(left, "Num") && matchType(right, "Num")) {
            return { ObjectType: "Num", value: left.value - right.value };
        } else if (matchType(left, "Set")) {
            if (matchType(right, "Set"))
                return { ObjectType: "Set", values: Object.keys(left.values).reduce((p, c) => right.values[c] ? p : {...p, [c]: left.values[c] }, {}) };
            return { ObjectType: "Set", values: Object.keys(left.values).reduce((p, c) => left.values[c].value === right.value ? p : {...p, [c]: left.values[c] }, {}) };
        }
    },
    "|": (left, right) => {
        return { ObjectType: "Set", values: Object.keys(right.values).reduce((p, c) => ({...p, [c]: right.values[c] }), left.values) };
    },
    "&": (left, right) => {
        return { ObjectType: "Set", values: Object.keys(right.values).reduce((p, c) => left.values[c] ? {...p, [c]: right.values[c] } : p, {}) };
    },
    "||": (left, right) => {
        return { ObjectType: "Bool", value: left.value || right.value };
    },
    "&&": (left, right) => {
        return { ObjectType: "Bool", value: left.value && right.value };
    },
    "or": (left, right) => {
        return { ObjectType: "Bool", value: left.value || right.value };
    },
    "and": (left, right) => {
        return { ObjectType: "Bool", value: left.value && right.value };
    },
    "in": (left, right) => {
        // need to fix
        switch (right.ObjectType) {
            case "String":
                // substring
                return { ObjectType: "Bool", value: right.value.includes(left.value) };
            case "Iterator":
                while (right.hasNext) {
                    if (deepEquals(left, right.next().current)) {
                        return { ObjectType: "Bool", value: true };
                    }
                }
                return { ObjectType: "Bool", value: false };
            case "List":
                return { ObjectType: "Bool", value: contains(left, right.values) }
            case "Testable":
                return { ObjectType: "Bool", value: right.test(left) };
            case "Set":
                return { ObjectType: "Bool", value: !!right.values[hash(left)] }
        }
        return { ObjectType: "Bool", value: false };
    },
}

const UnaryOpEvals = {
    "-": (val) => ({ ObjectType: val.ObjectType, value: -val.value }),
    "!": (val) => ({ ObjectType: "Bool", value: !val.value })
}

const OpTypes = {
    "===": [{ returns: "Bool" }],
    "==": [{ returns: "Bool" }],
    ">=": [{ returns: "Bool", left: "Num", right: "Num" }],
    "<=": [{ returns: "Bool", left: "Num", right: "Num" }],
    ">": [{ returns: "Bool", left: "Num", right: "Num" }],
    "<": [{ returns: "Bool", left: "Num", right: "Num" }],
    "%": [{ returns: "Num", left: "Num", right: "Num" }],
    "^": [{ returns: "Num", left: "Num", right: "Num" }, { returns: { type: "Function", input: { id: "A" }, output: { id: "A" } }, left: { type: "Function", input: { id: "A" }, output: { id: "A" } }, right: "Int" }],
    "++": [{ returns: "String", left: "String", right: "String" }, {
            returns: "List",
            left: { type: "List", listType: { id: "A" } },
            right: { type: "List", listType: { id: "A" } },
        }, {
            returns: "List",
            left: { id: "A" },
            right: { type: "List", listType: { id: "A" } }
        },
        { returns: "List", left: { type: "List", listType: { id: "A" } }, right: { id: "A" } }
    ],
    "**": [{ returns: { type: "List", listType: { id: "A" } }, left: { id: "A" }, right: "Int" }, { returns: "Matrix", right: "Tuple" }],
    "!=": [{ returns: "Bool" }],
    "!==": [{ returns: "Bool" }],
    "%=": [{ returns: "Bool", left: "Num", right: "Num" }],
    "%!=": [{ returns: "Bool", left: "Num", right: "Num" }],
    "|>": [{ returns: { id: "B" }, left: { id: "A" }, right: { type: "Function", input: { id: "A" }, output: { id: "B" } } }],
    "*": [{ returns: "Num", left: "Num", right: "Num" }, { returns: { type: "Function", input: { id: "A" }, output: { id: "C" } }, left: { type: "Function", input: { id: "A" }, output: { id: "B" } }, right: { type: "Function", input: { id: "B" }, output: { id: "C" } } }],
    "//": [{ returns: "Int", left: "Num", right: "Int" }],
    "/": [{ returns: "Num", left: "Num", right: "Num" }],
    "+": [{ returns: "Num", left: "Num", right: "Num" }],
    "-": [{ returns: "Set", left: "Set", right: "Set" }, { returns: "Num", left: "Num", right: "Num" }],
    "|": [{ returns: "Set", left: "Set", right: "Set" }],
    "&": [{ returns: "Set", left: "Set", right: "Set" }],
    "||": [{ returns: "Bool", left: "Bool", right: "Bool" }],
    "&&": [{ returns: "Bool", left: "Bool", right: "Bool" }],
    "or": [{ returns: "Bool", left: "Bool", right: "Bool" }],
    "and": [{ returns: "Bool", left: "Bool", right: "Bool" }],
    "in": [{ returns: "Bool", left: "Object", right: "Collection" }],
    "contains": [{ returns: "Bool", left: "Collection", right: "Object" }],
}

module.exports = { BinaryOpEvals, UnaryOpEvals }