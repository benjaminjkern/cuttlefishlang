import RULES from "./rules/index.js";
import { OPTIONAL } from "./parse/ruleUtils.js";
import { consoleWrite, environment } from "./util/environment.js";
import createIndentTree from "./indentTree/createIndentTree.js";
import {
    interpretIndentTree,
    newInterpretContext,
} from "./evaluate/interpret.js";

export const startRepl = async (getLine) => {
    environment.exitOnError = false;
    RULES.Statement.push({
        pattern: ["exit"],
        evaluate: () => process.exit(0),
    });
    // Slightly hacky! Change the print statement to be optional
    RULES.Statement[0].pattern[0] = OPTIONAL("print");
    const context = newInterpretContext();

    consoleWrite("Welcome to Cuttlefish v2.0.a\n");

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const line = await getLine();
        try {
            interpretIndentTree(createIndentTree(line), context);
        } catch (error) {
            // SHouldnt need to since the inside is already printing
            // console.error(error);
        }
    }
};
