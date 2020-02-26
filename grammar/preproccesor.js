const ohm = require('ohm-js');
const fs = require('fs');
const macroGrammar = ohm.grammar(fs.readFileSync('MacroGrammar.ohm'))

function macroparse(filename){

    const match = macroGrammar.match(fs.readFileSync(filename));
    let context = {}
    const builtin_funcs = { 
        append(list){
            function append_or_return(x){
                if(x == undefined){
                    return;
                }
                list.push(x);
                return append_or_return
            }
            return append_or_return
        },
        get(x){
            z = context
            function context_traverse(y){
                if(y == undefined){
                    return z
                }
                if(z[y] == undefined){
                    z[y] = []
                }
                z = z[y]
                return context_traverse
            }
            return context_traverse(x)
        },
        noex(fn){
            f = fn
            function noex_internal(g){
                if(g == undefined){
                    return f
                }
                f = f(g)
                return noex_internal
            }
            return noex_internal
        },
        def(handle){
            function def_internal(f){
                context.fns[handle] = f
                return x => {return;}
            }
            return def_internal
        }
    }
    context.fns = builtin_funcs
    const interpreter = macroGrammar.createSemantics().addOperation('exec', {
        Module(lines, _) {lines.exec();},
        Lines(linetype) {linetype.exec();},
        nonMacroLine(_1,_2){/* No-op */console.log(`No Macro ${this.sourceString}`)},
        emptyLine(_1){/* No-op */console.log("Empty Line")},
        MacroLine(_1, exp){console.log("macro");console.log(context);exp.exec();},
        Exp(_1,f,body,_2){console.log(f.sourceString);return body.exec().reduce((acc,head)=>{return acc(head)},f.exec())(undefined)},
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

macroparse("__tests__/macroTest.w")
