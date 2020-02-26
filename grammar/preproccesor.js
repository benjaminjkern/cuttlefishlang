const ohm = require('ohm-js');
const fs = require('fs');
const macroGrammar = ohm.grammar(fs.readFileSync('MacroGrammar.ohm'))

const generics = []
const sequences = []
const raw_sequences = []
const zero_space_ops = []
const interpreter = macroGrammar.createSemantics().addOperation('exec', {
    Module(lines, _) {lines.exec();},
    Lines(linetype) {linetype.exec();},
    nonMacroLine(_1,_2){/* No-op */},
    emptyLine(_1){/* No-op */},
    MacroLine(_1, exp , _2){exp.exec();},
    Exp(_1,f,body,_2){return [...body.exec(), undefined].reduce((acc,head)=>acc(head),f.exec())},
    Tuple(_1,body,_2)
});
const test = `
#! Generics = [a,b,c]
#! Sequences = [(xx!!,!!xx,abc),($,$,qed)]
#! RawSequences = [(r/,/,regexp)]
`

const match = macroGrammar.match(test);
if (match.succeeded()) {
    interpreter(match).exec();
    console.log(generics)
    console.log(sequences)
    console.log(raw_sequences)
} else {
      console.error(match.message);
      process.exitCode = 1;
}
