const ohm = require("ohm-js");
const fs = require("fs");

const {
    Program,
    Expression,
} = require("./node_defs");

const grammar = ohm.grammar(fs.readFileSync("./newGrammar.ohm"));

const astBuilder = grammar.createSemantics().addOperation("ast", {
    Program(_1, statementList, _2) {
        return new Program(statementList.flatMap(statement => statement.ast()));
    },
    Statement(expList, optBlock) {
        return [...expList.map(exp => exp.ast()), optBlock.ast()];
    },
    InlineExpression(stuff) {
        return stuff.ast();
    },
    AvoidingExpression(stuff) {
        return stuff.ast();
    },
    Block(_1, _2, _3, statementList, _4, _5) {
        return new Program(statementList.map(statement => statement.ast()))
    },
    String(s) {
        return s.ast();
    },
    String_expression(_1, inerts, _2) {
        const inertAST = inerts.ast();
        return astNode("Concat", inertAST[0].slice(1).reduce((p, c, i) => [...p, inertAST[1][i], c], [inertAST[0][0]]));
    },
    stringbit(_) {
        return astNode("String", this.sourceString);
    },
    StringExp(_1, exp, _2) {
        return exp.ast();
    },
    string(_1, inerts, _3) {
        return astNode("String", inerts.sourceString);
    },
    NonemptyListOf(first, sep, rest) {
        return { list: [first.ast(), ...rest.ast()], sep: sep.ast() };
    },
    EmptyListOf() {
        return { list: [], sep: null };
    },
    mumboJumbo() {
        return new Expression(this.sourceString);
    }
});

const makeAST = (sourceCode) => {
    const match = grammar.match(sourceCode);
    if (!match.succeeded()) throw new Error(match.message);
    return astBuilder(match).ast().analyze();
};

const astNode = (type, ...args) => {
    return { type, args };
}

module.exports = makeAST;

if (!module.parent) console.log(makeAST("f"));