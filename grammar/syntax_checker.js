module.exports = produceAST
var DEBUG = true
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
function produceAST(filename){
    let source = fs.readFileSync(filename,"utf8")
    let context = macroparser(filename)
    let grammar = context2grammar(context)
    let match = grammar.match(tokenize_indents(source))
        
    if(match.failed()){
        console.log(match.message)
        if(DEBUG){
            let match = grammar.trace(tokenize_indents(source))
            fs.writeFile(path.resolve(__dirname,"../logs/grammarTrace.txt"),match.toString(),function(err){
                if(err){
                    console.error(err)
                } else {
                    console.log("Trace written in logs")
                }
            })
        }
        return null
    }
    let nodeSpec = {}
    Object.assign(nodeSpec,defaultNodeSpecs)
    if(context.nodeSpec){
        Object.assign(nodeSpec,context.nodeSpec)
    }
    
    function node(type,...args){
        return nodes[type].constructor(...args)
    }

    let nodes = {}
    for (const [name,args] of Object.entries(defaultNodeSpecs)){
        nodes[name]={}
        nodes[name].template = {}
        Object.assign(nodes[name].template,baseNodeTemplate)
        nodes[name].template.type = name
        nodes[name].constructor = function(){
            let obj = {}
            Object.assign(obj,nodes[name].template)
            args.map((x,i)=>{obj[x] = arguments[i]})
            return obj
        }
    }

    const defaultASTBuilder = {
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
            return node('ListPattern',ltype,head,tail)
        },
        PatternElement_type(type,atom){return node('TypePattern',type,atom)},
        Type(id){return node('Type',id)},
        Type_functionType(tin,_1,tout){return node('FunctionType',tin,tout)},
        Type_list(lt){return lt.ast()},
        ListType(_1,type,_2){return node('ListType',type)},
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
            return node('Expression',atoms,kwargblock)
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
            return node('Select',object,selection)
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
        id(contents){return node('Id',this.sourceString)},
        numlit(_1,_2,_3,_4,_5,_6){return node('Numlit',this.sourceString)},
        NonemptyListOf(head,sep,tail){return [head,tail].map(x=>x.ast())},
    }

    let ast_operations = {}
    Object.assign(ast_operations,defaultASTBuilder)
    if(context.ASTNodes){
        Object.assign(ast_operations,context.ASTNodes)
    }
    let astBuilder = grammar.createSemantics().addOperation('ast',ast_operations)
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
}

const baseNodeTemplate = {
}

if(!module.parent){
    produceAST(path.resolve(__dirname,"../sample_programs/trivial_test.w"))
}
