import { readdirSync } from "fs";

import createIndentTree from "../src/indentTree/createIndentTree.js";
import { shouldCrash, shouldRun } from "../src/test/testUtils.js";

export const TEST_DIRECTORY = `${
    process.env.CUTTLEFISH_ROOT || process.cwd()
}/tests/`;

export default [
    shouldCrash("indentTree/badindentation.w", createIndentTree),
    shouldCrash("indentTree/badindentation2.w", createIndentTree),
    shouldRun("indentTree/commentsandindenttest.w", createIndentTree),
    // Assume all the rest of these are just positive test cases
    ...readdirSync(TEST_DIRECTORY)
        .filter((fileName) => fileName.slice(-2) === ".w")
        .map((fileName) => shouldRun(fileName)),
];
