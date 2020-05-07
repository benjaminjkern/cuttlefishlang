const DEBUG = false;

const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");
const basegrammar = require("../grammar/base_grammar");

const { inspect } = require("util");
const MacroHandler = require("../grammar/macro_parser.js");
const tokenize_indents = require("../grammar/tokenize_indents");

module.exports = (source) => {
    let macroContext = MacroHandler(source);
    let grammar = macroContext2grammar(macroContext);
    let match = grammar.match(tokenize_indents(source));

    if (match.failed() || DEBUG) {
        console.log(inspect);
        logTrace(grammar, match.message, source);
        return "";
    }

    /*
     * Creates the Node Specifications, by pulling any made by macros and combining them with the default ones.
     * Node Specifications are a name of an AST node keyed to an array of fields in that node.
     */

    let nodeSpecs = {};
    Object.assign(nodeSpecs, defaultNodeSpecs);
    if (macroContext.nodeSpecs) Object.assign(nodeSpecs, macroContext.nodeSpecs);
    macroContext.nodeSpecs = nodeSpecs;

    /*
     * Creates a parent (prototype) NodeTemplate (by pulling any made by macros and combining them with the default one.)
     * A Node Template is the prototype of the AST Node objects.
     */

    let baseNodeTemplate = { toString: defaultToString };
    Object.assign(baseNodeTemplate, defaultBaseNodeTemplate);
    if (macroContext.baseNodeTemplate)
        Object.assign(baseNodeTemplate, macroContext.baseNodeTemplate);
    macroContext.baseNodeTemplate = baseNodeTemplate;

    /*
     * This puts the default methods (toString and the like) into the parent NodeTemplate
     */
    Object.assign(macroContext.baseNodeTemplate, defaultMethods.default);

    /*
     * This adds the nodeConstructor for each AST Node type to the macroContext.
     * nodeConstructors include the template (protype) of that Node type,
     * and the function that constructs Nodes of that type.
     */

    macroContext.nodeConstructors = {};
    for (const [name, args] of Object.entries(macroContext.nodeSpecs)) {
        macroContext.nodeConstructors[name] = {};
        macroContext.nodeConstructors[name].template = Object.create(
            macroContext.baseNodeTemplate
        );
        macroContext.nodeConstructors[name].template.type = name;
        macroContext.nodeConstructors[name].construct = function() {
            let obj = Object.create(macroContext.nodeConstructors[name].template);
            obj.fields = {};
            args.map((x, i) => {
                obj.fields[x] = arguments[i];
            });
            return obj;
        };
    }

    /*
     * This adds methods to various Node templates, as defined in defaultMethods.
     * Primarily used to add a terminal flag to terminal nodes.
     */
    for (const [name, contents] of Object.entries(defaultMethods)) {
        if (name !== "default")
            Object.assign(macroContext.nodeConstructors[name].template, contents);
    }

    /*
     * The dynamic constructor of nodes. Just looks up the Node type's constructor and uses it.
     */
    const defaultASTOperations = require("./default_AST")(macroContext);

    /*
     * This adds macro-defined ASTOperations to the ast operation object
     */
    let ast_operations = {};
    Object.assign(ast_operations, defaultASTOperations);
    if (macroContext.ast_operations) {
        Object.assign(ast_operations, macroContext.ast_operations);
    }
    macroContext.ast_operations = ast_operations;

    /*
     * Builds the AST.
     */

    let astBuilder = grammar
        .createSemantics()
        .addOperation("ast", macroContext.ast_operations);
    let ast = astBuilder(match).ast();
    astArrayCleaner(ast);
    ast.specification_context = macroContext
    return ast;
};

function macroContext2grammar(macroContext) {
    return ohm.grammar(
        `CLG <: cuttlefish {
        ${[macroContext.local, macroContext.global, macroContext.exclusive]
          .map(grammarEntryExpander)
          .join("\n")}
    }`, { cuttlefish: basegrammar }
    );
}

function grammarEntryExpander(category) {
    if (!category) return "";

    return Object.entries(category.contents)
        .map((entry) => {
            let [name, body] = entry;
            let inserter = body.inserter ? body.inserter : "+=";
            let constructor = body.constructor;
            return (
                `${name} ${inserter} ` +
                body
                .map((x) => {
                    if (!constructor) {
                        return `"${x}"`;
                    } else {
                        return `${constructor}<${x.join(",")}>`;
                    }
                })
                .join(" | ")
            );
        })
        .join("\n");
}

function logTrace(grammar, error, source) {
    console.log(error);
    let match = grammar.trace(tokenize_indents(source));
    fs.writeFile(
        path.resolve(__dirname, "../logs/grammarTrace.txt"),
        match.toString(),
        function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Trace written in logs");
            }
        }
    );
}

const defaultNodeSpecs = {
    Specification: ["body"],
    PrintStatement: ["exp"],
    PutStatement: ["exp"],
    SubRoutineAssignment: ["id", "subroutine"],
    AssignmentStatement: ["id", "exp"],
    Pattern: ["patternElems"],
    TuplePattern: ["contents"],
    ListPattern: ["list_type", "head", "tail"],
    TypePattern: ["type", "id"],
    AtomicPattern: ["id"],
    FunctionType: ["input_type", "output_type"],
    ListType: ["type"],
    Type: ["id"],
    SubRoutineGroup: ["subroutine_block"],
    SingularSubRoutineGroup: ["statement_block"],
    FunctionGroup: ["subroutine_group"],
    ProcessGroup: ["subroutine_group"],
    ServerGroup: ["subroutine_group"],
    Guard: ["exp"],
    Expression: ["atoms"],
    GroupedExpressions: ["exps"],
    AbstractType: ["id", "pattern_block"],
    Select: ["subject", "predicate"],
    Tuple: ["contents"],
    NumList: ["start", "step", "end"],
    List: ["contents"],
    StringNode: ["contents"],
    MacroFlag: ["id"],
    Id: ["id"],
    Numlit: ["num"],
    SubRoutine: ["pattern", "guard", "returnTypes", "statements"],
    Operator: ["op"],
    String: ["contents"],
    InterpolatedString: ["strings", "expressions"],
};
const defaultBaseNodeTemplate = {};

function defaultToString() {
    return inspect(this, false, null, false);
}

function inspector(depth, options) {
    let obj = { type: this.type };
    Object.assign(obj,Object.getPrototypeOf(this))
    Object.assign(obj,this)
    return obj;
}

function children(node){ 
    if(node.terminal){
        return []
    }
    return Object.values(node.fields).filter(x => x && (x.fields || (Array.isArray(x) && x.every(y => y && y.fields)  )))
}

function traverse(node,callback,acc,exclude=[]){//callback of form f(node,accumulator,type) feel free to append
    
    var next_acc = callback(node,acc,node.type)
    return node.children(node).filter(x=> !exclude.includes(x.type)).map(x => {
        if(x.type){
            return (next_acc = x.traverse(x,callback,next_acc))
        }
        if(Array.isArray(x)){
            return x.filter(x=> !exclude.includes(x.type)).reduce((racc,y) =>{return y.traverse(y,callback,racc,exclude)},next_acc)
        }
    }).slice(-1).pop() || next_acc
}
function query(node,callback,acc,exclude){ //callback of the form f(node,accumulator,type). Returns an object with res(ults) and acc(ulumlator) 
    let {acc:vacc,res:new_out }= callback(node,acc,node.type)
    return [new_out ,
        ...node.children(node).filter(x => x && x.type).flatMap(x => { var {res:out ,acc:vacc} = query(x,callback,vacc,exclude);return out} ),   
        ...node.children(node).filter(x => x && Array.isArray(x)).flatMap(y => y.filter(x => x && x.type)
            .flatMap(x => { var {res:out ,acc:vacc} = query(x,callback,vacc,exclude);return out})) 
    ].flat(Infinity).filter(x => x)
}

const defaultMethods = {
    default: {
        toString: defaultToString,
        [inspect.custom]: inspector,
        children(node){return children(node)},
        traverse(a,b,c,d){return traverse(a,b,c,d)},
        query(a,b,c,d){return query(a,b,c,d)},
        show(){return inspect(this,{colors:true,customInspect:false,showHidden:true,depth:4})}
    },
    Operator: {
        terminal: true,
    },
    Id: {
        terminal: true,
    },
    Numlit: {
        terminal: true,
    },
    String: {
        terminal: true,
    },
};

// Object.defineProperty(Array.prototype, 'flat', {
//     value: function(depth = -1) {
//         return this.reduce(function(flat, toFlatten) {
//             return flat.concat((Array.isArray(toFlatten) && (depth === -1 || depth > 1)) ? toFlatten.flat(depth > 1 ? depth - 1 : -1) : toFlatten);
//         }, []);
//     }
// });

function astArrayCleaner(ast) {
    if (ast === undefined || ast === null || ast.terminal) return;

    Object.entries(ast.fields).forEach(([key, val]) => {
        if (Array.isArray(val)) {
            ast.fields[key] = ast.fields[key].flat();
            ast.fields[key].map((x) => astArrayCleaner(x));
        } else {
            astArrayCleaner(val);
        }
    });
}
