import { readFileSync } from "fs";

import createIndentTree from "./indentTree/createIndentTree.js";
import { interpretIndentTree } from "./evaluate/interpret.js";

// Cuttlefish command (Deal with arguments);
const cuttlefish = (node, file, ...args) => {
    if (args.length === 0) {
        console.warn("Error: Did not include a cuttlefish file!");
        return;
    }
    const readfile = readFileSync(args[0], "utf8");
    const indentTree = createIndentTree(readfile);
    interpretIndentTree(indentTree);
};

cuttlefish(...process.argv);
