import { readFileSync, existsSync } from "fs";

import createIndentTree from "./indentTree/createIndentTree.js";
import { interpretIndentTree } from "./evaluate/interpret.js";
import { CuttlefishError } from "./util/index.js";

// Cuttlefish command (Deal with arguments);
const cuttlefish = async (node, file, ...args) => {
    if (args.length === 0)
        throw CuttlefishError("Did not include a Cuttlefish file!");

    // TODO: Command line args here
    const filename = args[0];
    if (filename.slice(-2) !== ".w")
        console.warn(
            "Warning: Interpreting a file that does not have the .w (Cuttlefish) extension!"
        );
    if (!existsSync(filename))
        throw CuttlefishError(`File ${filename} does not exist!`);
    const readFile = readFileSync(filename, "utf8");
    const indentTree = createIndentTree(readFile);
    interpretIndentTree(indentTree);
};

cuttlefish(...process.argv);
