const fs = require('fs');

module.exports = (mod, f = x => x) => {
    if (mod.parent === null) {
        if (process.argv.length >= 3) {
            if (process.argv[2].endsWith(".w")) {
                console.log(f(mod.exports(fs.readFileSync(`./${process.argv[2]}`, 'utf8'))));
            } else {
                console.log(f(mod.exports(process.argv.slice(2).join(" "))));
            }
        } else {
            console.log("Please include a script or example text");
        }
    }
}