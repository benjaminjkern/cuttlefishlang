import { readCuttlefishFile } from "../cuttlefish.js";
import { interpretIndentTree } from "../evaluate/interpret.js";
import createIndentTree from "../indentTree/createIndentTree.js";

const interpret = (string) => interpretIndentTree(createIndentTree(string));

export const shouldCrash = (fileName, functionToRun = interpret) => ({
    fileName,
    runTest: (testDirectory) => {
        let readFile;
        try {
            readFile = readCuttlefishFile(`${testDirectory}${fileName}`);
        } catch (error) {
            return { error: `Error while reading file: ${error}` };
        }
        try {
            functionToRun(readFile);
        } catch (error) {
            return true;
        }
        return {
            error: `Expected a crash, but did not crash. Lol.`,
        };
    },
});

export const shouldRun = (fileName, functionToRun = interpret) => ({
    fileName,
    runTest: (testDirectory) => {
        let readFile;
        try {
            readFile = readCuttlefishFile(`${testDirectory}${fileName}`);
        } catch (error) {
            return { error: `Error while reading file: ${error}` };
        }
        try {
            functionToRun(readFile);
        } catch (error) {
            return { error };
        }
        return true;
    },
});
