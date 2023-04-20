import { readFileSync, existsSync } from "fs";
import promptPackage from "prompt-sync";
import promptHistory from "prompt-sync-history";

import "colors";

import createIndentTree from "./indentTree/createIndentTree.js";
import { interpretIndentTree } from "./evaluate/interpret.js";
import { CuttlefishError, colorString } from "./util/index.js";
import { runTests } from "./test/runTests.js";
import { consoleWarn } from "./util/environment.js";
import { startRepl } from "./repl.js";

// Cuttlefish command (Deal with arguments);
export const cuttlefishCommandLine = (node, file, ...args) => {
    if (args.length === 0) {
        const prompt = promptPackage({
            sigint: true,
            history: promptHistory(),
        });
        return startRepl(() => prompt(colorString("$", "red") + "> "));
    }

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
