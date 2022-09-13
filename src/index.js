const fs = require("fs");
const { inspect } = require("./util");

const createIndentTree = require("./parse/createIndentTree");
const parseExpressionAsType = require("./parse/parseExpression");
const evaluateExpression = require("./parse/evaluateExpression");

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    // const readfile = fs.readFileSync(args[0], "utf8");
    // console.log(inspect(createIndentTree(readfile)));
    const tree = parseExpressionAsType("Number", "8 *  4- 7/  9 - 3");
    console.log(inspect(tree));
    console.log(evaluateExpression(tree));
};

cuttlefish(...process.argv);
