const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path')
const macroGrammar = ohm.grammar(fs.readFileSync(path.resolve(__dirname,'MacroGrammar.ohm')))

function macroparse(filename){
    const match = macroGrammar.match(fs.readFileSync(path.resolve(__dirname,filename)));
    let context = {}
    const builtin_funcs = { 
        get(list){
            return list.reduce((acc,x) => {
                if(acc[x] == undefined){acc[x] = []};
                return acc[x]
            },context)
        },
        append(list){ 
            return list.slice(1).map(x => list[0].push(x))
        },
        print(list){
            console.log(list.join(" "))
        },
        def(list){
            [handle, f] = list
            context.fns[handle] = f
        },
        partial(list){
            [f, ...args] = list
            g = context.fns[f]
            return xs => g([...args, ...xs])
        },
        if(list){
            [cond, trueexp, falseexp] = list
            if(cond){
                return trueexp
            } else {
                return falseexp
            }
        },
        set(list){
            [x,val] = list
            x = val
        },
        not(list){
            return list.map(x => !x)
        }
    }
    context.fns = builtin_funcs
    const interpreter = macroGrammar.createSemantics().addOperation('exec', {
        Module(lines, _) {lines.exec();},
        Lines(linetype) {linetype.exec();},
        nonMacroLine(_1,_2){/* No-op */},
        emptyLine(_1){/* No-op */},
        MacroLine(_1, exp){exp.exec();},
        Exp(_1,f,body,_2){
            return f.exec()(body.exec())
        },
        Tuple(_1,body,_2){return body.exec()},
        func(f){return context.fns[f.sourceString]},
        id(x){return this.sourceString},
    });
    if (match.succeeded()) {
        interpreter(match).exec();
        console.log(context)
        return context
    } else {
      console.error(match.message);
      process.exitCode = 1;
    }
}
module.exports = macroparse 
if(!module.parent){
    macroparse("__tests__/macroTest.w")
}
