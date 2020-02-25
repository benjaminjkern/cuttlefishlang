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
    Exp(exptype){exptype.exec()},
    Generics(_1,_2,_3,list,_4){list.exec().map(x => {generics.push(x)} )}, 
    ZeroSpaceOps(_1,_2,_3,list,_4){list.exec().map(x => {zero_space_ops.push(x)} )}, 
    ListOf(members){return members.exec() },
    NonemptyListOf(_1,members,_2){return [_1.exec()].concat(_2.exec()) },
    id(prim_id){return this.sourceString},
    InheritScope(_){/* Probably Going to need something clever here*/},
    Sequences(_1, _2, _3, list, _4){list.exec().map(x => {sequences.push(x)})},
    RawSequences(_1,_2,_3,list, _4){list.exec().map(x => {raw_sequences.push(x)})},
    SequenceTuple(_1,a,_2,b,_3,c,_4){return [a.sourceString,b.sourceString,c.exec()]},
    _terminal(){}
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
