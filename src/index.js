const fs = require("fs");
const { inspect } = require("./util");

const createIndentTree = require("./parse/createIndentTree");

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    const readfile = fs.readFileSync(args[0], "utf8");
    console.log(inspect(createIndentTree(readfile)));
};

cuttlefish(...process.argv);
