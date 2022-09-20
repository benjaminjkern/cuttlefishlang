const fs = require("fs");
const { inspect } = require("./util");

const createIndentTree = require("./parse/createIndentTree");
const {
    parseExpressionAsType,
    setContext,
    setRules,
} = require("./parse/parseExpression");
const { evaluateIndentTree } = require("./parse/evaluate");
const parseIndentTree = require("./parse/parseIndentTree");

const { RULES } = require("./expressions");

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    setRules(RULES);
    const readfile = fs.readFileSync(args[0], "utf8");
    const parsedFile = parseIndentTree(createIndentTree(readfile));
    // console.log(inspect(parsedFile));
    evaluateIndentTree(parsedFile);
    // const tree = parseExpressionAsType("Statement", readfile);
    // // console.log(inspect(tree));
    // evaluateExpression(tree);
};

cuttlefish(...process.argv);
