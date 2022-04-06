const grammar = require("./base_grammar");

const astGenerator = grammar.createSemantics().addOperation('ast', {
    Program(_1, body, _2) {
        return astNode("Program", body.ast()[0]);
    },
    Statement(stmt) {
        return stmt.ast();
    },
    Assignment_single(assignee, _, exp) {
        return astNode("SingleAssignment", assignee.ast(), exp.ast());
    },
    Assignment_constant(assignee, _, exp) {
        return astNode("SingleAssignment", assignee.ast(), exp.ast(), true);
    },
    Assignment_multiple(assignees, _, exps) {
        const assignedAsts = assignees.ast()[0];
        const expAsts = exps.ast()[0];
        if (expAsts.length === 1)
            return astNode("Assignment", assignedAsts.map((assignee, i) => astNode("SingleAssignment", assignee, expAsts[0])));
        if (assignedAsts.length !== expAsts.length) throw "Syntax Error: In multi-assignment, there must be equal amounts on both sides of the =";
        return astNode("Assignment", assignedAsts.map((assignee, i) => astNode("SingleAssignment", assignee, expAsts[i])));
    },
    Assignment_multiple_constant(assignees, _, exps) {
        const assignedAsts = assignees.ast()[0];
        const expAsts = exps.ast()[0];
        if (expAsts.length === 1)
            return astNode("Assignment", assignedAsts.map((assignee, i) => astNode("SingleAssignment", assignee, expAsts[0], true)));
        if (assignedAsts.length !== expAsts.length) throw "Syntax Error: In multi-assignment, there must be equal amounts on both sides of the =";
        return astNode("Assignment", assignedAsts.map((assignee, i) => astNode("SingleAssignment", assignee, expAsts[i], true)));
    },
    Reassignment(assignee, op, _, exp) {
        return astNode("Reassignment", assignee.ast(), op.sourceString, exp.ast());
    },
    Print(_, exp) {
        return astNode("Print", exp.ast());
    },
    If(_1, test, ifTrue, _3, _4, _5, ifFalse) {
        return astNode("If", test.ast(), astNode("Program", ifTrue.ast()), astNode("Program", ifFalse.ast().flat()));
    },
    Switch(_1, object, patterns) {
        return astNode("Switch", object.ast(), patterns.ast());
    },
    Catch(_1, _2, patterns) {
        return astNode("Catch", patterns.ast());
    },
    For(_1, collection, patterns) {
        return astNode("For", collection.ast(), patterns.ast())
    },
    While(_1, test, statements) {
        return astNode("While", test.ast(), astNode("Program", statements.ast()));
    },
    Repeat(_1, count, statements) {
        let makeCount = count.ast().flat()[0];
        if (typeof makeCount === 'string') makeCount = undefined;
        return astNode("Repeat", makeCount, astNode("Program", statements.ast()));
    },
    Break(_) {
        return astNode("Break");
    },
    Continue(_) {
        return astNode("Continue");
    },
    Return(_, exp) {
        return astNode("Return", exp.ast()[0]);
    },
    Put(_, exp) {
        return astNode("Put", exp.ast());
    },
    Arg(exp, _) {
        return exp.ast();
    },
    Assignable(bit) {
        return bit.ast();
    },
    StmtExp(head, tail) {
        const atoms = [head.ast(), ...tail.ast()];
        return astNode("UnparsedExp", atoms);
    },
    Expression(expbits, block) {
        const atoms = [...expbits.ast(), ...block.ast().flat()];
        return astNode("UnparsedExp", atoms);
    },
    Atom(atom) {
        return atom.ast();
    },
    Atom_group(_1, exp, _2) {
        return exp.ast();
    },
    ref(_) {
        if (this.sourceString.toLowerCase() === 'true') return astNode("Bool", true);
        if (this.sourceString.toLowerCase() === 'false') return astNode("Bool", true);
        return this.sourceString;
    },
    // opWord(_1, _2) {
    //     return this.sourceString;
    // },
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
        return astNode("Set", values.ast()[0] || []);
    },
    Function(_1, _2, patterns) {
        return astNode("Function", patterns.ast());
    },
    Process(_1, _2, patterns) {
        return astNode("Process", patterns.ast());
    },
    PatternBlock_pattern(patterns) {
        return astNode("PatternBlock", patterns.ast().flat());
    },
    PatternBlock_statement(statements) {
        return astNode("PatternBlock", [astNode("Pattern", [], [], astNode("Program", statements.ast()))]);
    },
    Pattern_guard(input, cases) {
        // console.log(inspect(cases.ast()[1]));
        return cases.ast().reduce((p, c) => [...p, ...(c.length === 2 && c[c.length - 1].length === undefined ? [c] : c)], []).map(parsedCase => astNode("Pattern", input.ast()[0],
            ...parsedCase));
    },
    Pattern_return(input, output) {
        return astNode("Pattern", input.ast()[0], [], output.ast());
    },
    Guard_guard(_, test, cases) {
        // console.log(inspect(cases.ast()));
        // console.log(inspect(test.ast()));
        return cases.ast().map(parsedCase => [
            [test.ast(), ...parsedCase[0]], parsedCase[1]
        ]);
    },
    Guard_return(_, test, output) {
        // console.log(output.ast());
        return [
            test.ast(), output.ast()
        ];
    },
    Returnbit(_, statements) {
        return astNode("Program", statements.ast());
    },
    PatternElem_anonymous(type, _, def) {
        return astNode("PatternElem", ...type.ast().flat(), def.ast()[0])
    },
    TypeMatch_typed(type, modifier, id) {
        return [id.sourceString, astNode("UnparsedExp", [type.ast()]), ["?", "*"].includes(modifier.sourceString), ["+", "*"].includes(modifier.sourceString)]
    },
    TypeMatch_untyped(id) {
        return [id.sourceString, undefined, undefined, undefined];
    },
    Block_single(singleton) {
        return singleton.ast()[0];
    },
    Block_indented(_1, _2, _3, body, _4, _5) {
        return body.ast()[0];
    },
    Block_forced(_0, _1, _2, body, _3, _4) {
        return body.ast()[0];
    },
    String(s) {
        return s.ast();
    },
    String_expression(_1, start, inerts, _2) {
        const inertAST = inerts.ast();
        return astNode("Concat", inertAST[0].slice(1).reduce((p, c, i) => [...p, inertAST[1][i], c], [start.ast()]));
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
    indentnewline(_) {
        return this.sourceString;
    },
    // special_explicitsep(_, op) {
    //     return op.sourceString;
    // },
    // special_implicitsep(_, op) {
    //     return op.sourceString;
    // },
    special_sepop(_1, _2, op) {
        return op.sourceString;
    },
    special_last(_) {
        return this.sourceString;
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

const { inspect } = require('./utils');

require('./run_file')(module, res => require('util').inspect(res, false, null, false));