module.exports = produceAST
var DEBUG = false
const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");
const basegrammar = ohm.grammar(
  fs.readFileSync(path.resolve(__dirname, "cuttlefish.ohm"))
);
const macroparser = require(path.resolve(__dirname,"macroparser.js"));
const tokenize_indents = require(path.resolve(__dirname,"tokenize_indents.js"));

function context2grammar(context){
    return ohm.grammar(`CLG <: cuttlefish {
        ${[context.local,context.global,context.exlusive].map(grammarEntryExpander).join("\n") }
    }`,{"cuttlefish":basegrammar})
}
function grammarEntryExpander(category){
    if(!category){return ""}
    return category.entries().map(entry => {
        let [name,body] = entry
        let inserter = body.inserter ? body.inserter : "+="
        let constructor = body.constructor
        return `${name} ${inserter} ` + body.map(x => {
            if (!constructor){
                return `"${x}"`
            } else {
                return `${constructor}<${x.join(",")}>`
            }
        }).join(' | ')
    }).join("\n")
}
function logTrace(grammar,error,source){
    console.log(error)
        let match = grammar.trace(tokenize_indents(source))
        fs.writeFile(path.resolve(__dirname,"../logs/grammarTrace.txt"),
            match.toString(),function(err){
            if(err){
                console.error(err)
            } else {
                console.log("Trace written in logs")
            }
        })
}

function produceAST(filename){
    let source = fs.readFileSync(filename,"utf8")
    let context = macroparser(filename)
    let grammar = context2grammar(context) 
    let match = grammar.match(tokenize_indents(source))
    
    if(match.failed() || DEBUG){
        logTrace(grammar,match.message,source)
        return ""
    }

    let nodeSpecs = {}
    Object.assign(nodeSpecs,defaultNodeSpecs)
    if(context.nodeSpecs){
        Object.assign(nodeSpecs,context.nodeSpecs)
    }
    context.nodeSpecs = nodeSpecs

    let baseNodeTemplate = {toString:defaultToString}
    Object.assign(baseNodeTemplate,defaultBaseNodeTemplate)
    if(context.baseNodeTemplate){
        Object.assign(baseNodeTemplate,context.baseNodeTemplate)
    }
    context.baseNodeTemplate = baseNodeTemplate
    Object.assign(context.baseNodeTemplate,defaultMethods.default)

    context.nodeConstructors = {}
    for (const [name,args] of Object.entries(context.nodeSpecs)){
        context.nodeConstructors[name] = {}
        context.nodeConstructors[name].template = Object.create(context.baseNodeTemplate)
        context.nodeConstructors[name].template.type = name
        context.nodeConstructors[name].construct = function(){
            let obj = Object.create(context.nodeConstructors[name].template)
            obj.fields = {}
            args.map((x,i)=>{obj.fields[x] = arguments[i]})
            return obj
        }
    }
    for (const [name,contents] of Object.entries(defaultMethods)){
        if ( name !== "default"){
            Object.assign(context.nodeConstructors[name].template,contents)
        }
    }

    function node(type, ...args){
        return context.nodeConstructors[type].construct(...args)
    }
    const defaultASTOperations = {
        Specification(_1,head,_2,tail,_3){
            return node('Specification',[head, tail].map(x => x.ast()))
        },
        Statement(statement){return statement.ast()},
        Statement_print(_1,exp){return node('PrintStatement',exp.ast())},
        Statement_put(_1,exp){return node('PutStatement',exp.ast())},
        AssignmentStatement_functionAssignment(pattern,_1,srg){
            return node('SubRoutineAssignment',pattern.ast(),srg.ast())
        },
        AssignmentStatement_regularAssignment(pattern,_1,exp){
            return node('AssignmentStatement',pattern.ast(),exp.ast())
        },
        Pattern(pelems){return node('Pattern',pelems.ast())},
        PatternElement(atom){return node('AtomicPattern',atom.ast())},
        PatternElement_patternTuple(contents){
            return node('TuplePatter',contents.ast())
        },
        PatternElement_patternList(ltype,head,_1,tail){
            return node('ListPattern',ltype.ast(),head.ast(),tail.ast())
        },
        Block_large(a1,_1,a2,_2,_3,_4,a3,_5,a4,_6,_7,_8,_9){return [a1,a2,a3,a4].map(x => x.ast())},
        Block_small(a1,_1,a2,_2){return [a1,a2].map(x=>x.ast()) },
        PatternElement_type(type,atom){return node('TypePattern',type.ast(),atom.ast())},
        Type(id){return node('Type',id.ast())},
        Type_functionType(tin,_1,tout){return node('FunctionType',tin.ast(),tout.ast())},
        Type_list(lt){return lt.ast()},
        ListType(_1,type,_2){return node('ListType',type.ast())},
        SubRoutineGroup(srgblock){
            return node('SubRoutineGroup',srgblock.ast())
        },
        SubRoutineGroup_singular(stmtblock){
            return node('SingularSubRoutineGroup',stmtblock.ast())
        },
        Routine(sr){return sr.ast()},
        Function(_1,_2,srg){
            return node('FunctionGroup',srg.ast())
        },
        Process(_1,_2,srg){
            return node('ProcessGroup',srg.ast())
        },
        Server(_1,_2,srg){
            return node('ServerGroup',srg.ast())
        },
        Guard(_1,exp){node('Guard',exp)},
        Expression_newline(atoms,kwargblock){
            return node('Expression',atoms.ast(),kwargblock.ast())
        },
        Kwarg(id,_1,exp){return node('Kwarg',id,exp)},
        Atom(contents){return contents.ast()},
        Atom_singleton(_1,exp_block,_2){
            return node('GroupedExpressions',exp_block.ast())
        },
        AbstractType(_1, _2, id, _3,_4,pattern_block){
            return node('AbstractType',id.ast(),pattern_block.ast())
        },
        Select(object,_1,selection,_2){
            return node('Select',object.ast(),selection.ast())
        },
        Tuple(_1,neck,_2,rump,_3){
            return node('Tuple',[...neck,rump].map(x => x.ast()) )
        },
        List_numlist(_1,start,_2,step,_3,end,_4){
            return node('NumList',start.ast(),step.ast(),end.ast())
        },
        List(seq){
            return node('List',seq.ast())
        },
        String(seq){
            return node('StringNode',seq.ast())
        },
        SubRoutine(pattern,guard,_1,statements){return node("SubRoutine",pattern.ast(),guard.ast(),statements.ast())},
        id(contents){return node('Id',this.sourceString)},
        numlit(_1,_2,_3,_4,_5,_6){return node('Numlit',this.sourceString)},
        NonemptyListOf(head,sep,tail){return [head,tail].map(x=>x.ast())},
        nospaceops(op){return node("Operator",this.sourceString)},
    }
    let ast_operations = {}
    Object.assign(ast_operations,defaultASTOperations)
    if(context.ast_operations){
        Object.assign(ast_operations,context.ast_operations)
    }
    context.ast_operations = ast_operations

    let astBuilder = grammar.createSemantics().addOperation('ast',context.ast_operations)
    return astBuilder(match).ast()

}

const defaultNodeSpecs = {
  Specification :["body"],
  PrintStatement :["exp"],
  PutStatement :["exp"],
  SubRoutineAssignment :["id","subroutine"],
  AssignmentStatement :["id","exp"],
  Pattern :["patternElems"],
  TuplePattern:["contents"],
  ListPattern :["list_type","head","tail"],
  TypePattern :["type","id"],
  AtomicPattern :["id"],
  FunctionType :["input_type","output_type"],
  ListType:["type"],
  Type:["id"],
  SubRoutineGroup :["subroutine_block"],
  SingularSubRoutineGroup:["statement_block"],
  FunctionGroup:["subroutine_group"],
  ProcessGroup:["subroutine_group"],
  ServerGroup:["subroutine_group"],
  Guard:["exp"],
  Expression:["atoms","kwarg_block"],
  Kwarg :["id","exp"],
  GroupedExpressions:["exps"],
  AbstractType:["id","pattern_block"],
  Select:["subject","predicate"],
  Tuple:["contents"],
  NumList:["start","step","end"],
  List:["contents"],
  StringNode:["contents"],
  MacroFlag:["id"],
  Id:["id"],
  Numlit:["num"],
    SubRoutine:["pattern","guard","statements"],
  Operator:["op"],
}
const defaultBaseNodeTemplate = {}
function defaultToString(key="root",ind=0){
    return indents(ind) + key+"->" + this.type + ":\n" +
        Object.keys(this.fields).map(x => this.fields[x].toString(x,ind+1) ).join()
}
function indents(n){
    console.log(`indenting :${this.type} ${n}`)
    return "  ".repeat(n)
}
function baseToString(){
    return Object.entries(this.fields).reduce((acc,x) =>{
        let [key,value] = x
        return acc + this.type + ":" + value + "\n"
    },"")
}
const defaultMethods = {
    default: {
        toString : defaultToString
    },
    Id : {
        toString : baseToString
    },
    Numlit : {
        toString : baseToString
    },
    StringNode : {
        toString : baseToString
    },
}
if(!module.parent){
    let ast = produceAST(path.resolve(__dirname,"../sample_programs/trivial_test.w"))
    console.log(ast.toString())
}
