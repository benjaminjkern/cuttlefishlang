const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");
const basegrammar = ohm.grammar(
  fs.readFileSync(path.resolve(__dirname, "cuttlefish.ohm"))
);
const macroparser = require("macroparser.js");


function context2grammar(context){
    return ohm.grammar(`CLG <: cuttlefish {
        ${grammarEntryExpander(context.global)}
        ${grammarEntryExpander(context.local)}
        ${grammarEntryExpander(context.exclusive)}
    }`,basegrammar)
}
function grammarEntryExpander(category){
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
    }) + "\n"
}
function produceAST(filename){
    let source = fs.readFileSync(filename)
    let grammar = context2grammar(macroparser(source))
    grammar.match(source).createSemantics()
}



function node(type,...args){
    let newNode = new obj.protype.constructor
    Object.keys(newNode).map((x,i) => newNode[x] = args[i])
    return newNode
}

class Specification {
    body
}

class PrintStatement {
    exp
}

class PutStatement {
    exp
}

class SubRoutineAssignment {
    id
    subroutine
}

class AssignmentStatement {
    id
    exp
}

class Pattern {
    patternElems
}

class TuplePattern {
    contents
}

class ListPattern {
    list_type
    head
    tail
}

class TypePattern {
    type
    id
}

class AtomicPattern {
    id
}

class FunctionType {
    input_type
    output_type
}

class ListType{
    type
}

class Type{
    id
}

class SubRoutineGroup{
    subroutine_block
}

class SingularSubRoutineGroup{
    statement_block
}

class FunctionGroup{
    subroutine_group
}

class ProcessGroup{
    subroutine_group
}

class ServerGroup{
    subroutine_group
}

class Guard{
    exp
}

class Expression{
    atoms
    kwarg_block
}

class Kwarg {
    id
    exp
}

class GroupedExpressions{
    exps
}

class AbstractType{
    id
    pattern_block
}

class Select{
    subject
    predicate
}

class Tuple{
    contents
}

class NumList{
    start
    step
    end
}

class List{
    contents
}

class StringNode{
    contents
}

class MacroFlag{
    id
}

class Id{
    id
}

class Numlit{
    num
}
const defaultASTBuilder = {
    Specification(_1,head,_2,tail,_3){
        return node(Specification,[s1, ...s2].map(x => x.ast()))
    },
    Statement(statement){return statement.ast()},
    Statement_print(_1,exp){return node(PrintStatement,exp.ast())},
    Statement_put(_1,exp){return node(PutStatement,exp.ast())},
    AssignmentStatement_functionAssignment(pattern,_1,srg){
        return node(SubRoutineAssignment,pattern.ast(),srg.ast())
    },
    AssignmentStatement_regularAssignment(pattern,_1,exp){
        return node(AssignmentStatement,pattern.ast(),exp.ast())
    },
    Pattern(pelems){return node(Pattern,pelems.ast())},
    PatternElement(atom){return node(AtomicPattern,id.ast())}
    PatternElement_patternTuple(contents){
        return node(TuplePatter,contents.ast())
    },
    PatternElement_patternList(ltype,head,_1,tail){
        return node(ListPattern,ltype,head,tail)
    },
    PatternElement_type(type,atom){return node(TypePattern,type,atom)},
    Type(id){return node(Type,id)},
    Type_functionType(tin,_1,tout){return node(FunctionType,tin,tout)},
    Type_list(lt){return lt.ast()},
    ListType(_1,type,_2){return node(ListType,type)},
    SubRoutineGroup(srgblock){
        return node(SubRoutineGroup,srgblock.ast())
    },
    SubRoutineGroup_singular(stmtblock){
        return node(SingularSubRoutineGroup,stmtblock.ast())
    },
    Routine(sr){return sr.ast()},
    Function(_1,_2,srg){
        return node(FunctionGroup,srg.ast())
    },
    Process(_1,_2,srg){
        return node(ProcessGroup,srg.ast())
    },
    Server(_1,_2,srg){
        return node(ServerGroup,srg.ast())
    },
    Guard(_1,exp){node(Guard,exp)},
    Expression_newline(atoms,kwargblock){
        return node(Expression,atoms,kwargblock)
    },
    Kwarg(id,_1,exp){return node(Kwarg,id,exp)},
    Atom(contents){return contents.ast()},
    Atom_singleton(_1,exp_block,_2,_3){
        return node(GroupedExpressions,exp_block.ast())
    },
    AbstractType(_1, _2, id, _3,_4,pattern_block){
        return node(AbstractType,id.ast(),pattern_block.ast())
    },
    Select(object,_1,selection,_2){
        return node(Select,object,selection)
    },
    Tuple(_1,neck,_2,rump,_3){
        return node(Tuple,[...neck,rump].map(x => x.ast()) )
    },
    List_numlist(_1,start,_2,step,_3,end,_4){
        return node(NumList,start.ast(),step.ast(),end.ast())
    },
    List(seq){
        return node(List,seq.ast())
    },
    String(seq){
        return node(StringNode,seq.ast())
    },
    id(_1,_2,_3){return node(Id,this.sourceString())},
    numlit(..._1){return node(Numlit,this.sourceString())},
}
