const ohm = require("ohm-js");
const fs = require("fs");

const {
    Program,
    Assignment,
    Print,
    Application,
    Lambda,
    Identifier,
} = require("./node_defs");

const grammar = ohm.grammar(fs.readFileSync("./cuttlefish2.ohm"));

const astBuilder = grammar.createSemantics().addOperation("ast", {
    Program(_1, body, _2) {
        return new Block(body.ast());
    },
    Process(prc) {
        return prc.ast();
    },
    Process_group(prc) {
        return prc.ast();
    },
    Block(_1, _2, _3, block, _4, _5) {
        return new Block(block.ast());
    },
    If_else(_1, condition, _2, ifTrue, _3, ifFalse) {
        return new If(condition.ast(), ifTrue.ast(), ifFalse.ast());
    },
    If_default(_1, condition, _2, ifTrue) {
        return new If(condition.ast(), ifTrue.ast());
    },
    While(_1, condition, _2, loop) {
        return new While(condition.ast(), loop.ast());
    },
    For(_1, id, _2, iterator, _3, loop) {
        return new For(id.sourceString, iterator.ast(), loop.ast())
    },
    Assignment(pattern, _, exp) {
        return new Assignment(id.sourceString, exp.ast())
    },
    Reassignment(id, op, _, exp) {
        return new Assignment(id.sourceString, /* figure this out */ );
    },
    Print(_, exp) {
        return new Print(exp.ast())
    },
    Return(_, exp) {
        return new Return(exp ? exp.ast() : undefined)
    },
    Expression_walrus(id, _, exp) {
        return new InPlaceAssignment(id.ast(), exp.ast())
    },
    Expression(exp) {
        return exp.ast()
    },
    Expression4_ternary(condition, _1, ifTrue, _2, ifFalse) {
        return new TernaryExp(condition.ast(), ifTrue.ast(), ifFalse.ast());
    },
    Expression4(exp) {
        return exp.ast()
    },
    Expression5_or(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression5(exp) {
        return exp.ast()
    },
    Expression6_and(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression6(exp) {
        return exp.ast()
    },
    Expression10_equal(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression10(exp) {
        return exp.ast()
    },
    Expression11_relation(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression11(exp) {
        return exp.ast()
    },
    Expression12_and(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression12(exp) {
        return exp.ast()
    },
    Expression13_and(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression13(exp) {
        return exp.ast()
    },
    Expression14_and(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression14(exp) {
        return exp.ast()
    },
    Expression15_and(exp1, op, exp2) {
        return new BinaryExp(exp1.ast(), op.sourceString, exp2.ast());
    },
    Expression15(exp) {
        return exp.ast()
    },
    Expression16_and(op, exp) {
        return new UnaryExp(op.sourceString, exp.ast());
    },
    Expression16(exp) {
        return exp.ast()
    },
    Expression19_element(exp, _, id) {
        return new ElementOf(exp.ast(), id.sourceString)
    },
    Expression19_select(exp1, _1, exp2, _2) {
        return new Selection(exp1.ast(), exp2.ast())
    },
    Expression19_application(exp1, exp2) {
        return new Application(exp1.ast(), exp2.ast());
    },
    Atom_singleton(_1, exp, _2) {
        return exp.ast();
    },
    Atom(object) {
        return object.ast();
    },
    Function(_1, _2, subroutines) {
        return new Function(asArray(subroutines.ast()))
    },
    Subroutine_guarded(pattern, guards) {
        return asArray(guards.ast()).map(guardedprocess => new Subroutine(pattern.ast(), guardedprocess.guard, guardedprocess.process));
    },
    Subroutine_direct(pattern, _, processes) {
        return asArray(processes.ast()).map(process => new Subroutine(pattern.ast(), new Guard(true), process.ast()));
    },
    Pattern(exp) {
        return new Pattern(asArray(exp.ast()));
    },
    PatternElement_tuple(_1, list, _2) {
        return new TuplePattern(list.ast());
    },
    PatternElement_list(type, head, _, tail) {
        return new Pattern(type.ast(), head.ast(), tail, ast())
    },
    PatternElement_typed(type, id) {
        return new Pattern(type.ast(), id.ast())
    },
    PatternElement_atomic(atom) {
        return new Pattern(new Type(), )
    }
    id(_1, _2) {
        return new Identifier(this.sourceString);
    },
});

const asArray = x => x.length ? x : [x];

const makeAST = (sourceCode) => {
    const match = grammar.match(sourceCode);
    if (!match.succeeded()) throw new Error(match.message);
    return astBuilder(match).ast().analyze();
};

module.exports = makeAST;