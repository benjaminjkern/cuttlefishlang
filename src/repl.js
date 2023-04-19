import RULES from "./rules/index.js";
import { OR, type } from "./parse/ruleUtils.js";
import { consoleWrite, environment } from "./util/environment.js";
import { evaluateExpression } from "./evaluate/evaluate.js";
import { print } from "./rules/statement.js";
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
    RULES.Statement.push({
        pattern: [OR(type("Iterable"), type("stringlike"))],
        evaluate: ({ tokens: [toPrint] }) => {
            print(evaluateExpression(toPrint));
            consoleWrite("\n");
        },
    });
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
