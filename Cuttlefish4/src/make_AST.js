const grammar = require("./base_grammar");

const astGenerator = grammar.createSemantics().addOperation('ast', {
    Program(_1, body, _2) {
        return astNode("Program", body.ast()[0]);
    },
    Statement(stmt) {
        return stmt.ast();
    },
    Assignment_single(assignee, _, exp) {
        return astNode("Assignment", [astNode("SingleAssignment", assignee.ast(), exp.ast())]);
    },
    Assignment_multiple(assignees, _, exps) {
        const assignedAsts = assignees.ast()[0];
        const expAsts = exps.ast()[0];
        if (assignedAsts.length !== expAsts.length) throw "Syntax Error: In multi-assignment, there must be equal amounts on both sides of the =";
        return astNode("Assignment", assignedAsts.map((assignee, i) => astNode("SingleAssignment", assignee, expAsts[i])));
    },
    Reassignment(assignee, op, _, exp) {
        return astNode("Reassignment", assignee.ast(), op.sourceString, exp.ast());
    },
    Print(_, exp) {
        return astNode("Print", exp.ast());
    },
    If(_1, test, _2, ifTrue, _3, _4, _5, ifFalse) {
        return astNode("If", test.ast(), ifTrue.ast(), ifFalse.ast());
    },
    Catch(_1, _2, patterns) {
        return astNode("Catch", patterns.ast());
    },
    While(_1, test, _2, statements) {
        return astNode("While", test.ast(), statements.ast());
    },
    Repeat(_1, _2, statements) {
        return astNode("Repeat", statements.ast());
    },
    For(_1, collection, _2, patterns) {
        return astNode("For", collection.ast(), patterns.ast())
    },
    Break(_) {
        return astNode("Break");
    },
    Continue(_) {
        return astNode("Continue");
    },
    Return(_, exp) {
        return astNode("Return", exp.ast());
    },
    Put(_, exp) {
        return astNode("Put", exp.ast());
    },
    Assignable(bit) {
        return bit.ast();
    },
    Expression(exp) {
        return exp.ast();
    },
    Expression_ternary(test, _1, ifTrue, _2, ifFalse) {
        return astNode("Ternary", test.ast(), ifTrue.ast(), ifFalse.ast());
    },
    Expression1(exp) {
        return exp.ast();
    },
    Expression1_operator(left, op, right) {
        return astNode("BinaryOp", left.ast(), op.sourceString, right.ast());
    },
    Expression2(exp) {
        return exp.ast();
    },
    Expression2_application(func, input) {
        return astNode("Application", func.ast(), [input.ast()]);
    },
    Expression2_block(func, input) {
        return astNode("Application", func.ast(), input.ast());
    },
    Expression3(exp) {
        return exp.ast();
    },
    Expression3_nospaceapplication(func, _, input) {
        return astNode("Application", func.ast(), [input.ast()]);
    },
    Expression4(exp) {
        return exp.ast();
    },
    Atom(atom) {
        return atom.ast();
    },
    Atom_group(_1, exp, _2) {
        return exp.ast();
    },
    ref(_) {
        return astNode("Ref", this.sourceString);
    },
    DiscreteRange(left, start, _1, step, _2, end, right) {
        return astNode("DiscreteRange", start.ast(), left.sourceString === "[", end.ast(), right.sourceString === "]", step.ast());
    },
    ContinuousRange(left, start, _, end, right) {
        return astNode("ContinuousRange", start.ast(), left.sourceString === "[", end.ast(), right.sourceString === "]");
    },
    ElementOf(parent, _, childId) {
        return astNode("ElementOf", parent.ast(), childId.ast());
    },
    Tuple(_1, values, _2, _3) {
        return astNode("Tuple", values.ast()[0]);
    },
    List(_1, values, _2, _3) {
        return astNode("List", values.ast()[0]);
    },
    Set(_1, values, _2, _3) {
        return astNode("Set", values.ast()[0]);
    },
    Map(_1, values, _2) {
        return astNode("Map", values.ast());
    },
    Function_pattern(_1, _2, patterns) {
        return astNode("Function", patterns.ast(), []);
    },
    Function_statement(_1, _2, statements) {
        return astNode("Function", [], statements.ast());
    },
    Process_pattern(_1, _2, patterns) {
        return astNode("Process", patterns.ast(), []);
    },
    Process_statement(_1, _2, statements) {
        return astNode("Process", [], statements.ast());
    },
    Pattern_guard(input, cases) {
        return astNode("Pattern", input.ast()[0], cases.ast(), []);
    },
    Pattern_return(input, output) {
        return astNode("Pattern", input.ast()[0], [], output.ast());
    },
    Guard_guard(_, test, cases) {
        return astNode("Case", test.ast(), cases.ast(), []);
    },
    Guard_return(_, test, output) {
        return astNode("Case", test.ast(), [], output.ast());
    },
    Returnbit(_, statements) {
        return statements.ast();
    },
    PatternElem_anonymous(type, _, def) {
        return astNode("PatternElem", ...type.ast().flat(), def.ast())
    },
    TypeMatch_typed(type, modifier, id) {
        return [id.sourceString, type.ast(), ["?", "*"].includes(modifier.sourceString), ["+", "*"].includes(modifier.sourceString)]
    },
    TypeMatch_untyped(id) {
        return [id.sourceString, undefined, undefined, undefined];
    },
    Type_list(_1, type, _2) {
        return astNode("ListType", type.ast());
    },
    Type_ref(ref) {
        return ref.ast();
    },
    Block_single(singleton) {
        return [singleton.ast()];
    },
    Block_indented(_1, _2, _3, body, _4, _5) {
        return body.ast()[0];
    },
    String(s) {
        return s.ast();
    },
    String_expression(_1, inerts, _2) {
        return astNode("ExpressionString", ...inerts.ast())
    },
    stringbit(_) {
        return astNode("String", this.sourceString);
    },
    StringExp(_1, exp, _2) {
        return exp.ast();
    },
    number(_1, _2, _3, _4, _5, _6, _7) {
        return astNode("Num", +this.sourceString);
    },
    string(_1, inerts, _3) {
        return astNode("String", inerts.sourceString);
    },
    NonemptyListOf(first, sep, rest) {
        const elems = [first.ast(), ...rest.ast()];
        return [
            elems, ...sep.ast()
        ];
    },
    EmptyListOf() {
        return [];
    },
    newline(_1, _2, _3) {
        return [];
    },
    _terminal() {
        return this.sourceString;
    }
});

const ASTNodeFields = require("./ast_nodes");
const checkSyntax = require("./syntax_checker");
const fs = require('fs');

const astNode = (type, ...params) => {
    return { ASTType: type, ...ASTNodeFields[type].reduce((p, c, i) => (params[i] !== undefined ? {...p, [c]: params[i] } : p), {}) };
}

const makeAST = (text) => {
    const match = checkSyntax(text);
    if (!match.succeeded()) {
        throw new Error(`Syntax Error: ${match.message}`);
    }
    return astGenerator(match).ast();
}

module.exports = makeAST;

if (module.parent === null) {
    if (process.argv.length >= 3) {
        if (process.argv[2].endsWith(".w")) {
            console.log(require('util').inspect(module.exports(fs.readFileSync(`./${process.argv[2]}`, 'utf8')), false, null, false));
        } else {
            console.log(require('util').inspect(module.exports(process.argv.slice(2).join(" ")), false, null, false));
        }
    } else {
        console.log("Please include a script or example text");
    }
}