import { readFileSync, existsSync } from "fs";

import createIndentTree from "./indentTree/createIndentTree.js";
import { interpretIndentTree } from "./evaluate/interpret.js";
import { CuttlefishError } from "./util/index.js";
import { runTests } from "./test/runTests.js";
import { consoleWarn } from "./util/environment.js";

// Cuttlefish command (Deal with arguments);
export const cuttlefishCommandLine = async (node, file, ...args) => {
    if (args.length === 0)
        throw CuttlefishError("Did not include a Cuttlefish file!");

    if (args[0] === "test") return runTests();

    // TODO: Command line args here
    interpretIndentTree(createIndentTree(readCuttlefishFile(args[0])));
};

export const readCuttlefishFile = (filename) => {
    if (filename.slice(-2) !== ".w")
        consoleWarn(
            "Warning: Interpreting a file that does not have the .w (Cuttlefish) extension!"
        );
    if (!existsSync(filename))
        throw CuttlefishError(`File ${filename} does not exist!`);

    return readFileSync(filename, "utf8");
};
