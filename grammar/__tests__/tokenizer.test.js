const path = require('path')
const fs = require('fs')
const tokenizer = require(path.resolve(__dirname,'../tokenize_indents.js'))
const ohm = require("ohm-js");
const basegrammar = ohm.grammar(
    fs.readFileSync(path.resolve(__dirname, "../cuttlefish.ohm"))
);

describe("The Tokenizer+Grammar", ()=>{
    test('parses the super program', done => {
        expect(basegrammar.match(
            tokenizer(fs.readFileSync(path.resolve(
                __dirname,'../../sample_programs/super_program.w'))))
        .succeeded())
            .toBe(true);

        done();
    });
});
