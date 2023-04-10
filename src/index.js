import { readFileSync } from "fs";
import { inspect } from "./util/index.js";

import createIndentTree from "./parse/createIndentTree.js";
import {
    parseExpressionAsType,
    setContext,
    setRules,
} from "./parse/parseExpression.js";
import { evaluateIndentTree } from "./parse/evaluate.js";
import parseIndentTree from "./parse/parseIndentTree.js";
import { interpretIndentTree } from "./parse/interpret.js";

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    if (args.length === 0) {
        console.warn("Error: Did not include a cuttlefish file!");
        return;
    }
    const readfile = readFileSync(args[0], "utf8");
    const indentTree = createIndentTree(readfile);
    interpretIndentTree(indentTree);
    // const evaluatedTree = evaluateIndentTree(parsedTree);
};

cuttlefish(...process.argv);
