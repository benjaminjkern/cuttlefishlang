const makeAST = require("./makeAST.js");
const fs = require("fs");

const getFile = () => {
    let fileText;
    try {
        fileText = fs.readFileSync(process.argv[process.argv.length - 1]);
    } catch (e) {
        fileText = process.argv[process.argv.length - 1];
    }
    return fileText;
};

try {
    if (process.argv.length === 3) {
        makeAST(getFile()).run();
    } else if (process.argv.length === 4) {
        const Program = makeAST(getFile());
        const language = process.argv[2].slice(1).toLowerCase();
        console.log(Program.gen(language));
    } else {
        console.error(
            "\nSyntax: node cuttlefish2.js [-(language)] program\nLeave the language option out to run the program internally.\nCurrently supported languages:\n  JavaScript: -js\n"
        );
        process.exitCode = 1;
    }
} catch (e) {
    console.error(e.message);
    process.exitCode = 2;
}