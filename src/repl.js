import promptPackage from "prompt-sync";
import promptHistory from "prompt-sync-history";
import { newContext } from "./parse/context.js";
import RULES from "./rules/index.js";
import GENERICS from "./rules/generics.js";
import { OR, type } from "./parse/ruleUtils.js";
import { consoleWrite, environment } from "./util/environment.js";
import { evaluateExpression } from "./evaluate/evaluate.js";
import { print } from "./rules/statement.js";
import createIndentTree from "./indentTree/createIndentTree.js";
import { interpretIndentTree } from "./evaluate/interpret.js";
const prompt = promptPackage({ sigint: true, history: promptHistory() });

export const startRepl = () => {
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
    const context = { ...newContext(RULES, GENERICS), vars: [] };

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const line = prompt("$".red + "> ");
        try {
            interpretIndentTree(createIndentTree(line), context);
        } catch (error) {
            // SHouldnt need to since the inside is already printing
            // console.error(error);
        }
    }
};
