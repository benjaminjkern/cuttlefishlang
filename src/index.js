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
    if (args.length === 0) {
        console.warn("Error: Did not include a cuttlefish file!");
        return;
    }
    setRules(RULES);
    const readfile = fs.readFileSync(args[0], "utf8");
    const indentTree = createIndentTree(readfile);
    const parsedTree = parseIndentTree(indentTree);
    const evaluatedTree = evaluateIndentTree(parsedTree);
};

cuttlefish(...process.argv);
