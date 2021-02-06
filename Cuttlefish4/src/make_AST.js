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
        return astNode("If", test.ast(), astNode("Program", ifTrue.ast()), astNode("Program", ifFalse.ast().flat()));
    },
    Catch_pattern(_1, _2, patterns) {
        return astNode("Catch", patterns.ast(), astNode("Program", []));
    },
    Catch_statement(_1, _2, statements) {
        return astNode("Catch", [], astNode("Program", statements.ast()));
    },
    For_pattern(_1, collection, _2, patterns) {
        return astNode("For", collection.ast(), patterns.ast(), astNode("Program", []))
    },
    For_statement(_1, collection, _2, statements) {
        return astNode("For", collection.ast(), [], astNode("Program", statements.ast()))
    },
    While(_1, test, _2, statements) {
        return astNode("While", test.ast(), astNode("Program", statements.ast()));
    },
    Repeat(_1, count, _2, statements) {
        return astNode("Repeat", count.ast().flat()[0], astNode("Program", statements.ast()));
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
        return astNode("DiscreteRange", start.ast(), left.sourceString === "[", end.ast()[0], right.sourceString === "]", step.ast()[0]);
    },
    ContinuousRange(left, start, _, end, right) {
        return astNode("ContinuousRange", start.ast(), left.sourceString === "[", end.ast()[0], right.sourceString === "]");
    },
    ElementOf(parent, _, childId) {
        return astNode("ElementOf", parent.ast(), childId.ast());
    },
    Tuple(_1, values, _2, _3) {
        return astNode("Tuple", values.ast()[0] || []);
    },
    List(_1, values, _2, _3) {
        return astNode("List", values.ast()[0] || []);
    },
    Set(_1, values, _2, _3) {
        return astNode("Set", values.ast()[0] || {});
    },
    Function_pattern(_1, _2, patterns) {
        return astNode("Function", patterns.ast(), astNode("Program", []));
    },
    Function_statement(_1, _2, statements) {
        return astNode("Function", [], astNode("Program", statements.ast()));
    },
    Process_pattern(_1, _2, patterns) {
        return astNode("Process", patterns.ast(), astNode("Program", []));
    },
    Process_statement(_1, _2, statements) {
        return astNode("Process", [], astNode("Program", statements.ast()));
    },
    Pattern_guard(input, cases) {
        return astNode("Pattern", input.ast()[0], cases.ast(), astNode("Program", []));
    },
    Pattern_return(input, output) {
        return astNode("Pattern", input.ast()[0], [], output.ast());
    },
    Guard_guard(_, test, cases) {
        return astNode("Case", test.ast()[0], cases.ast(), astNode("Program", []));
    },
    Guard_return(_, test, output) {
        return astNode("Case", test.ast()[0], [], output.ast());
    },
    Returnbit(_, statements) {
        return astNode("Program", statements.ast());
    },
    PatternElem_anonymous(type, _, def) {
        return astNode("PatternElem", ...type.ast().flat(), def.ast()[0])
    },
    TypeMatch_typed(type, modifier, id) {
        return [id.sourceString, type.ast(), ["?", "*"].includes(modifier.sourceString), ["+", "*"].includes(modifier.sourceString)]
    },
    TypeMatch_untyped(id) {
        return [id.sourceString, undefined, undefined, undefined];
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
        const inertAST = inerts.ast();
        return astNode("Concat", inertAST[0].slice(1).reduce((p, c, i) => [...p, c, inertAST[1][i]], [inertAST[0][0]]));
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
        return [
            [first.ast(), ...rest.ast()], sep.ast()
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

const astNode = (type, ...params) => {
    return { ASTType: type, ...ASTNodeFields[type].reduce((p, c, i) => (params[i] !== undefined ? {...p, [c]: params[i] } : p), {}) };
}

module.exports = (text) => {
    const match = checkSyntax(text);
    if (!match.succeeded()) {
        throw new Error(`Syntax Error: ${match.message}`);
    }
    return astGenerator(match).ast();
}

require('./run_file')(module, res => require('util').inspect(res, false, null, false));