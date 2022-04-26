const process = require('process')
const macroGrammar = require('./macro_grammar');

module.exports = (source) => {
    const match = macroGrammar.match(source);
    const always_available = {
        get: function(obj,val){
            if(obj[val] === undefined){
                obj[val] = []
            }
            return obj[val]
        }
    }


    let context = {
        global : {
            funcs: {
                get: (list) =>
                    list.reduce((acc, x) => {
                        if (acc[x] === undefined) acc[x] = [];
                        return acc[x];
                    }, context),
                append: (list) => {
                    list.slice(1).map((x) => context.exclusive.contents[list[0]].push(x))
                },
                print: (list) => {
                    console.log(list.join(" "));
                },
                def: (list) => {
                    let [handle, f] = list;
                    context.exclusive.funcs[handle] = f;
                },
                partial: (list) => {
                    let [f, ...args] = list;
                    let g = context.exclusive.funcs[f];
                    return (xs) => g([...args, ...xs]);
                },
                if: (list) => {
                    let [cond, trueExp, falseExp] = list;
                    return cond ? trueExp : falseExp;
                },
                set: (list) => {
                    let [x, val] = list;
                    x = val;
                },
                not: (list) => list.map((x) => !x),
            },
            _content : {},
        }
    };

    context.global.contents = new Proxy(context.global._content,always_available)
    context.local = Object.create(context.global);
    context.local._content = Object.create(context.global._content)
    context.local.contents = new Proxy(context.local._content,always_available)
    context.exclusive = Object.create(context.local);
    context.exclusive._content = Object.create(context.local._content)
    context.exclusive.contents = new Proxy(context.exclusive._content,always_available)


    const interpreter = macroGrammar.createSemantics().addOperation("exec", {
        Module(lines, _) {
            lines.exec();
        },
        Lines(linetype) {
            linetype.exec();
        },
        nonMacroLine(_1, _2) {
            /* No-op */
        },
        emptyLine(_1) {
            /* No-op */
        },
        MacroLine(_1, exp) {
            exp.exec();
        },
        Exp(_1, f, body, _2) {
            return f.exec()(body.exec());
        },
        Tuple(_1, body, _2) {
            return body.exec();
        },
        func(f) {
            return context.exclusive.funcs[f.sourceString];
        },
        id(x) {
            return this.sourceString;
        },
    });

    if (match.succeeded()) {
        interpreter(match).exec();
        return context;
    } else {
        console.error(match.message);
        process.exitCode = 1;
    }
};
