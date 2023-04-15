import "colors";
import testList, { TEST_DIRECTORY } from "../../tests/testList.js";
import { environment } from "../util/environment.js";

export const runTests = () => {
    environment.exitOnError = false;
    environment.log = false;

    let passed = 0;
    let failed = 0;

    for (const test of testList) {
        const result = test.runTest(TEST_DIRECTORY); // I liked the test directory being in testList just cuz its a more public file
        if (result.error) {
            console.log("X ".red + test.fileName);
            console.log(result.error);
            failed++;
        } else {
            console.log("✓ ".green + test.fileName);
            passed++;
        }
    }
    if (failed === 0) {
        console.log(`All tests passed! (${passed} tests run)`.green);
        return;
    }

    console.log(
        `${passed} passed`.green +
            ", " +
            `${failed} failed`.red +
            ` (${passed + failed} tests run)`
    );
};
