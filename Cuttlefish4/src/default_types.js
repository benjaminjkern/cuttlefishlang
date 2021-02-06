const Types = {
    Object: {
        subtypes: ["Function", "Process", "List", "Num", "String", "Bool"]
    },
    List: {
        generics: ["listType"],
    },
    Function: {
        generics: ["input", "output"]
    },
    Process: {
        generics: ["input", "output"]
    },
    Num: {
        subtypes: ["Real", "Imaginary"]
    },
    Real: {
        subtypes: ["Int"]
    },
    Int: {},
    String: {},
    Bool: {},
}

const Ops = {
    "===": [{ returns: "Bool" }],
    "==": [{ returns: "Bool" }],
    ">=": [{ returns: "Bool", left: "Num", right: "Num" }],
    "<=": [{ returns: "Bool", left: "Num", right: "Num" }],
    ">": [{ returns: "Bool", left: "Num", right: "Num" }],
    "<": [{ returns: "Bool", left: "Num", right: "Num" }],
    "*": [{ returns: "Num", left: "Num", right: "Num" }, { returns: { type: "Function", input: { id: "A" }, output: { id: "C" } }, left: { type: "Function", input: { id: "A" }, output: { id: "B" } }, right: { type: "Function", input: { id: "B" }, output: { id: "C" } } }],
    "//": [{ returns: "Int", left: "Num", right: "Int" }],
    "/": [{ returns: "Num", left: "Num", right: "Num" }],
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
    "!=": [{ returns: "Bool" }],
    "!==": [{ returns: "Bool" }],
    "%=": [{ returns: "Bool", left: "Num", right: "Num" }],
    "|>": [{ returns: { id: "B" }, left: { id: "A" }, right: { type: "Function", input: { id: "A" }, output: { id: "B" } } }],
    "+": [{ returns: "Num", left: "Num", right: "Num" }],
    "-": [{ returns: "Num", left: "Set", right: "Set" }],
}