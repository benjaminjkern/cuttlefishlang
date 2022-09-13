const fs = require("fs");
const { inspect } = require("./util");

const createIndentTree = require("./parse/createIndentTree");
const parseExpressionAsType = require("./parse/parseExpression");
const evaluateExpression = require("./parse/evaluateExpression");

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    const readfile = fs.readFileSync(args[0], "utf8");
    // console.log(inspect(createIndentTree(readfile)));
    const tree = parseExpressionAsType("Statement", readfile);
    // console.log(inspect(tree));
    console.log(evaluateExpression(tree));
};

cuttlefish(...process.argv);
