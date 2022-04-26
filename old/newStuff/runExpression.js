const RUNRULES = {
    add: (args) => resolve(args[0]) + resolve(args[1]),
    sub: (args) => resolve(args[0]) - resolve(args[1]),
    mult: (args) => resolve(args[0]) * resolve(args[1]),
    div: (args) => resolve(args[0]) / resolve(args[1]),
    exp: (args) => resolve(args[0]) ** resolve(args[1]),
    not: (args) => !resolve(args[0]),
    lt: (args) => resolve(args[0]) < resolve(args[1]),
    gt: (args) => resolve(args[0]) > resolve(args[1]),
    lte: (args) => resolve(args[0]) <= resolve(args[1]),
    gte: (args) => resolve(args[0]) >= resolve(args[1]),
    deepEqual: (args) => isEqual(resolve(args[0]), resolve(args[1])),
    shallowEqual: (args) => resolve(args[0]).pid === resolve(args[1]).pid,
    or: (args) => resolve(args[0]) || resolve(args[1]),
    nor: (args) => !(resolve(args[0]) || resolve(args[1])),
    and: (args) => resolve(args[0]) && resolve(args[1]),
    nand: (args) => !(resolve(args[0]) && resolve(args[1])),
    xor: (args) =>
        (!resolve(args[0]) && !resolve(args[1])) ||
        (resolve(args[0]) && resolve(args[1])),
    xnor: (args) =>
        (!resolve(args[0]) && resolve(args[1])) ||
        (!resolve(args[0]) && resolve(args[1])),
    print: (args) => console.log(resolve(args[0])),
    if: (args) => {
        if (resolve(args[0])) resolve(args[1]);
    },
    ifelse: (args) => {
        if (resolve(args[0])) resolve(args[1]);
        else resolve(args[2]);
    },
    while: (args) => {
        // this might be wrong
        while (resolve(args[0])) resolve(args[1]);
    },
    Marissa: (args) => {
        console.log(`Gave Marissa ${resolve(args[0])} cookies!`);
    },
};

const resolve = (node) => {
    if (typeof node.value === "string") {
        if (!isNaN(node.value - 0)) return node.value - 0;
        if (node.value === "true") return true;
        if (node.value === "false") return false;
        return node.value;
    } else if (typeof node.value !== "object") return node.value;
    return RUNRULES[node.value.op](node.value.args);
};

const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

const { parseExpression } = require("./parseExpression");

console.log(
    resolve(
        parseExpression(
            [
                "while",
                { type: "boollit", value: true, id: "Marissa is cute" },
                "give",
                "marissa",
                { type: "numlit", value: 1 },
                "cookies",
            ],
            "Statement"
        )
    )
);