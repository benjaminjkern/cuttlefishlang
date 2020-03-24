module.exports = produceAST;
var DEBUG = true;
const util = require("util");

const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");
const basegrammar = ohm.grammar(
    fs.readFileSync(path.resolve(__dirname, "grammar/cuttlefish.ohm"))
);
const macroparser = require(path.resolve(__dirname, "grammar/macroparser.js"));
const tokenize_indents = require(path.resolve(
    __dirname,
    "grammar/tokenize_indents.js"
));

function context2grammar(context) {
    return ohm.grammar(
        `CLG <: cuttlefish {
        ${[context.local, context.global, context.exlusive]
          .map(grammarEntryExpander)
          .join("\n")}
    }`, { cuttlefish: basegrammar }
    );
}

function grammarEntryExpander(category) {
    if (!category) {
        return "";
    }
    return category
        .entries()
        .map(entry => {
            let [name, body] = entry;
            let inserter = body.inserter ? body.inserter : "+=";
            let constructor = body.constructor;
            return (
                `${name} ${inserter} ` +
                body
                .map(x => {
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

function produceAST(filename) {
    let source = fs.readFileSync(filename, "utf8");
    let grammar = context2grammar(macroparser(filename));
    let match = grammar.match(tokenize_indents(source));

    if (match.failed()) {
        console.log(match.message);
        if (DEBUG) {
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
        return null;
    }
    let astBuilder = grammar
        .createSemantics()
        .addOperation("ast", defaultASTBuilder);
    return astBuilder(match).ast();
}

function node(type, ...args) {
    let newNode = new type();
    Object.keys(newNode).map((x, i) => (newNode[x] = args[i]));
    return newNode;
}

class Specification {
    constructor(statement_block) {
        this.statement_block = statement_block;
    }
}

class PrintStatement {
    constructor(body) {
        this.body = body;
    }
}

class PutStatement {
    constructor(body) {
        this.body = body;
    }
}

class SubRoutineAssignment {
    constructor(id, routine) {
        this.id = id;
        this.routine = routine;
    }
}

class AssignmentStatement {
    constructor(id, exp) {
        this.id = id;
        this.exp = exp;
    }
}

class Pattern {
    constructor(patternElems) {
        this.patternElems = patternElems;
    }
}

class TuplePattern {
    constructor(elems) {
        this.elems = elems;
    }
}

class ListPattern {
    constructor(list_type, head, tail) {
        this.list_type = list_type;
        this.head = head;
        this.tail = tail;
    }
}

class TypePattern {
    constructor(type, id) {
        this.type = type;
        this.id = id;
    }
}

class AtomicPattern {
    constructor(id) {
        this.id = id;
    }
}

class FunctionType {
    constructor(input_type, output_type) {
        this.input_type = input_type;
        this.output_type = output_type;
    }
}

class ListType {
    constructor(type) {
        this.type = type;
    }
}

class Type {
    constructor(id) {
        this.id = id;
    }
}

class SubRoutineGroup {
    constructor(subroutine_block) {
        this.subroutine_block = subroutine_block;
    }
}

class SingularSubRoutineGroup {
    constructor(statement_block) {
        this.statement_block = statement_block;
    }
}

class FunctionGroup {
    constructor(subroutine_group) {
        this.subroutine_group = subroutine_group;
    }
}

class ProcessGroup {
    constructor(subroutine_group) {
        this.subroutine_group = subroutine_group;
    }
}

class ServerGroup {
    constructor(subroutine_group) {
        this.subroutine_group = subroutine_group;
    }
}

class Guard {
    constructor(exp) {
        this.exp = exp;
    }
}

class Expression {
    constructor(atoms, kwarg_block) {
        this.atoms = atoms;
        this.kwarg_block = kwarg_block;
    }
}

class Kwarg {
    constructor(id, exp) {
        this.id = id;
        this.exp = exp;
    }
}

class GroupedExpressions {
    constructor(exps) {
        this.exps = exps;
    }
}

class AbstractType {
    constructor(id, patternBlock) {
        this.id = id;
        this.patternBlock = patternBlock;
    }
}

class Select {
    constructor(subject, predicate) {
        this.subject = subject;
        this.predicate = predicate;
    }
}

class Tuple {
    constructor(elems) {
        this.elems = elems;
    }
}

class NumList {
    constructor(start, step, end) {
        this.start = start;
        this.step = step;
        this.end = end;
    }
}

class List {
    constructor(elems) {
        this.elems = elems;
    }
}

class StringNode {
    constructor(elems) {
        this.elems = elems;
    }
}

class MacroFlag {
    constructor(id) {
        this.id = id;
    }
}

class Id {
    constructor(name) {
        this.name = name;
    }
}

class Numlit {
    constructor(num) {
        this.num = num;
    }
}

const defaultASTBuilder = {
    Specification(_1, head, _2, tail, _3) {
        return node(
            Specification, [head, tail].map(x => x.ast())
        );
    },
    Statement(statement) {
        return statement.ast();
    },
    Statement_print(_1, exp) {
        return node(PrintStatement, exp.ast());
    },
    Statement_put(_1, exp) {
        return node(PutStatement, exp.ast());
    },
    AssignmentStatement_functionAssignment(pattern, _1, srg) {
        return node(SubRoutineAssignment, pattern.ast(), srg.ast());
    },
    AssignmentStatement_regularAssignment(pattern, _1, exp) {
        return node(AssignmentStatement, pattern.ast(), exp.ast());
    },
    Pattern(pelems) {
        return node(Pattern, pelems.ast());
    },
    PatternElement(atom) {
        return node(AtomicPattern, atom.ast());
    },
    PatternElement_patternTuple(contents) {
        return node(TuplePattern, contents.ast());
    },
    PatternElement_patternList(ltype, head, _1, tail) {
        return node(ListPattern, ltype, head, tail);
    },
    PatternElement_type(type, atom) {
        return node(TypePattern, type, atom);
    },
    Type(id) {
        return node(Type, id);
    },
    Type_functionType(tin, _1, tout) {
        return node(FunctionType, tin, tout);
    },
    Type_list(lt) {
        return lt.ast();
    },
    ListType(_1, type, _2) {
        return node(ListType, type);
    },
    SubRoutineGroup(srgblock) {
        return node(SubRoutineGroup, srgblock.ast());
    },
    SubRoutineGroup_singular(stmtblock) {
        return node(SingularSubRoutineGroup, stmtblock.ast());
    },
    Routine(sr) {
        return sr.ast();
    },
    Function(_1, _2, srg) {
        return node(FunctionGroup, srg.ast());
    },
    Process(_1, _2, srg) {
        return node(ProcessGroup, srg.ast());
    },
    Server(_1, _2, srg) {
        return node(ServerGroup, srg.ast());
    },
    Guard(_1, exp) {
        node(Guard, exp);
    },
    Expression_newline(atoms, kwargblock) {
        return node(Expression, atoms, kwargblock);
    },
    Kwarg(id, _1, exp) {
        return node(Kwarg, id, exp);
    },
    Atom(contents) {
        return contents.ast();
    },
    Atom_singleton(_1, exp_block, _2) {
        return node(GroupedExpressions, exp_block.ast());
    },
    AbstractType(_1, _2, id, _3, _4, pattern_block) {
        return node(AbstractType, id.ast(), pattern_block.ast());
    },
    Select(object, _1, selection, _2) {
        return node(Select, object, selection);
    },
    Tuple(_1, neck, _2, rump, _3) {
        return node(
            Tuple, [...neck, rump].map(x => x.ast())
        );
    },
    List_numlist(_1, start, _2, step, _3, end, _4) {
        return node(NumList, start.ast(), step.ast(), end.ast());
    },
    List(seq) {
        return node(List, seq.ast());
    },
    String(seq) {
        return node(StringNode, seq.ast());
    },
    id(contents) {
        return node(Id, this.sourceString);
    },
    numlit(_1, _2, _3, _4, _5, _6) {
        return node(Numlit, this.sourceString);
    },
    NonemptyListOf(head, sep, tail) {
        return [head, tail].map(x => x.ast());
    }
};

if (!module.parent) {
    let ast = produceAST(
        path.resolve(__dirname, "./sample_programs/trivial_test.w")
    );
    console.log(util.inspect(ast, false, 6, true));
}