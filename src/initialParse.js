// First parse through: Just break everything up into indent-based tree structure
// Also included in this: Removal of comments and empty lines


const CuttlefishError = (string) => {
    console.log(string);
    process.exit(-1);
}

// Remove comments and empty lines
const filterLines = (lines) => {
    const filteredLines = [];
    let inComment = false;
    for (const line of lines) {
        let lineToPush = '';
        let existingLine = line;
        while (existingLine) {
            if (inComment) {
                const blockComment = existingLine.search(/###/);
                if (blockComment === -1) break;
                existingLine = ' ' + existingLine.substring(blockComment + 3);
                inComment = false;
            }
            const firstComment = existingLine.search(/#/);
            if (firstComment === -1) {
                lineToPush += existingLine;
                break;
            }
            lineToPush += existingLine.substring(0, firstComment);
            if (line.substring(firstComment, firstComment + 3) !== '###') break;
            existingLine = existingLine.substring(firstComment + 3);
            inComment = true;
        }
        if (!lineToPush.match(/^\s*$/)) filteredLines.push(lineToPush);
    }
    return filteredLines;
}

const createIndentTree = sourceString => {
    const lines = sourceString.split(/\r|\n/g);

    const filteredLines = filterLines(lines);

    const topLevelProgram = { statements: [] };
    let firstIndent;
    let currentIndent = 0;
    let currentProgram = topLevelProgram;
    for (const line of filteredLines) {
        const indent = line.match(/^\s*/g)[0].length;
        if (!firstIndent) firstIndent = indent;
        else if (indent < firstIndent) throw CuttlefishError(`Indentation issue! ${indent} < ${firstIndent}`);

        const realLine = line.substring(indent);
        if (indent === currentIndent) {
            currentIndent = indent;
            currentProgram.statements.push(realLine);
            continue;
        }
        if (indent > currentIndent) {
            const newObject = { instantiatorStatement: currentProgram.statements.splice(currentProgram.statements.length - 1)[0], statements: [realLine], parent: currentProgram };
            currentProgram.statements.push(newObject);
            currentProgram = newObject;
        } else {
            const parent = currentProgram.parent;
            delete currentProgram.parent;
            currentProgram = parent;
            currentProgram.statements.push(realLine);
        }
        currentIndent = indent;
    }

    // Track back up tree
    while (currentProgram !== topLevelProgram) {
        const parent = currentProgram.parent;
        delete currentProgram.parent;
        currentProgram = parent;
    }

    return topLevelProgram;
}

module.exports = createIndentTree;

const inspect = obj => require('util').inspect(obj, false, null, true);

console.log(inspect(createIndentTree("Hello\nhi there\n  hello\n\n\n###\n  hi\n    hello\n  oh yeah\n  i go to parties\nhahahaha")));

