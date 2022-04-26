// First parse through: Just break everything up into indent-based tree structure
// Also included in this: Removal of comments and empty lines
const { CuttlefishError } = require("../util");

// Remove comments and empty lines
const filterLines = (lines) => {
    const filteredLines = [];
    let inComment = false;
    for (const { lineNumber, line } of lines) {
        let lineToPush = "";
        let existingLine = line;
        while (existingLine) {
            if (inComment) {
                const blockComment = existingLine.search(/###/);
                if (blockComment === -1) break;
                existingLine = " " + existingLine.substring(blockComment + 3);
                inComment = false;
            }
            const firstComment = existingLine.search(/#/);
            if (firstComment === -1) {
                lineToPush += existingLine;
                break;
            }
            lineToPush += existingLine.substring(0, firstComment);
            if (line.substring(firstComment, firstComment + 3) !== "###") break;
            existingLine = existingLine.substring(firstComment + 3);
            inComment = true;
        }
        if (!lineToPush.match(/^\s*$/))
            filteredLines.push({ lineNumber, line: lineToPush });
    }
    return filteredLines;
};

const createIndentTree = (sourceString) => {
    const lines = sourceString
        .split(/\r\n|\n\r|\n|\r/g)
        .map((line, i) => ({ lineNumber: i + 1, line }));

    const filteredLines = filterLines(lines);

    const topLevelProgram = { statements: [] };
    let firstIndent;
    let currentIndent = 0;
    let currentProgram = topLevelProgram;
    for (const { lineNumber, line } of filteredLines) {
        const indent = line.match(/^\s*/g)[0].length;
        if (firstIndent === undefined) {
            firstIndent = indent;
            currentProgram.indent = firstIndent;
        } else if (indent < firstIndent)
            throw CuttlefishError(
                `${lineNumber}: Line indented deeper than start of file! (Line: ${indent}, File: ${firstIndent})`
            );

        const realLine = line.substring(indent);
        if (indent === currentIndent) {
            currentProgram.statements.push(realLine);
            continue;
        }
        if (indent > currentIndent) {
            const newObject = {
                instantiatorStatement: currentProgram.statements.splice(
                    currentProgram.statements.length - 1
                )[0],
                statements: [realLine],
                parent: currentProgram,
                indent,
            };
            currentProgram.statements.push(newObject);
            currentProgram = newObject;
        } else {
            while (indent !== currentProgram.indent) {
                if (!currentProgram.parent)
                    throw CuttlefishError(
                        `${lineNumber}: Did not indent back to any parent indentation! (Line: ${indent})`
                    );
                const parent = currentProgram.parent;
                delete currentProgram.parent;
                delete currentProgram.indent;
                currentProgram = parent;
                currentProgram.statements.push(realLine);
            }
        }
        currentIndent = indent;
    }

    // Track back up tree
    while (currentProgram !== topLevelProgram) {
        const parent = currentProgram.parent;
        delete currentProgram.parent;
        delete currentProgram.indent;
        currentProgram = parent;
    }

    delete currentProgram.indent;

    return topLevelProgram;
};

module.exports = createIndentTree;
