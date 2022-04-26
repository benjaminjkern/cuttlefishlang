const fs = require('fs');

const checklist = ['', '../examples/'];

const fileName = (dir, file) => {
    if (!dir) return file;
    return dir + file.split('').reduce((p, c) => c === '/' ? '' : p + c, '');
}

module.exports = (mod, f = x => x) => {
    if (mod.parent === null) {
        if (process.argv.length >= 3) {
            let text;
            if (process.argv[2].endsWith(".w")) {
                for (const dir of checklist) {
                    // console.log(fileName(dir, process.argv[2]))
                    try {
                        text = fs.readFileSync(fileName(dir, process.argv[2]), 'utf8');
                        break;
                    } catch (e) {}
                }
            } else {
                text = process.argv.slice(2).join(" ");
            }
            console.log(f(mod.exports(text)));
        } else {
            console.log("Please include a script or example text");
        }
    }
}