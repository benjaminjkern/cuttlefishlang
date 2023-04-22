import RULES from "./rules/index.js";
import { consoleWrite, environment } from "./util/environment.js";
import createIndentTree from "./indentTree/createIndentTree.js";
import {
    interpretIndentTree,
    newInterpretContext,
} from "./evaluate/interpret.js";
import { print } from "./rules/statement.js";

export const startRepl = async (getLine) => {
    environment.exitOnError = false;
    RULES.Statement.push({
        pattern: ["exit"],
        evaluate: () => process.exit(0),
    });
    RULES.Statement.push({
        pattern: RULES.Statement[0].pattern.slice(2),
        evaluate: ({ tokens: [obj], context }) => {
            print(context.evaluateExpression(obj));
            consoleWrite("\n");
        },
    });
    const context = newInterpretContext();

    consoleWrite(`Welcome to Cuttlefish v2.0.a\n`);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const line = await getLine();
        try {
            interpretIndentTree(createIndentTree(line), context);
        } catch (error) {
            // SHouldnt need to since the inside is already printing
            console.error(error);
        }
    }
};
