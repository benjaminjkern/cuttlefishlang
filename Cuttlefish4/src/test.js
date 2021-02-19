const fs = require('fs');
require('colors');
if (process.argv.length < 3) {
    console.log("Please include a to test upon!");
    return;
}

let errors = [];

fs.readdirSync('../examples/').forEach(file => {
    try {
        require('./' + process.argv.slice(2))(fs.readFileSync('../examples/' + file, 'utf8'));
    } catch (e) {
        errors.push(file + " : " + (e + '').magenta);
    }
});

if (!errors.length) console.log("All examples run without errors, congrats!".green)
else {
    console.log("Found ".red + (errors.length + '').yellow + " errors:".red);
    errors.forEach(file => console.log("  " + file));
}