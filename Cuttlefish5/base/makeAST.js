const ohm = require("ohm-js");
const fs = require("fs");

const inspect = (object) =>
    console.log(require("util").inspect(object, false, null, true));

const { Program, Expression, UnparsedExpression } = require("./node_defs");

const grammar = ohm.grammar(fs.readFileSync("./newGrammar.ohm"));

const astBuilder = grammar.createSemantics().addOperation("ast", {
    Program(_1, statementList, _2) {
        return new Program(statementList.ast().list.flat());
    },
    Statement(expList, optBlock) {
        return [...expList.ast().list, ...optBlock.ast()];
    },
    InlineExpression(stuff) {
        const ast = stuff.ast();
        if (ast.length === 1) return ast[0];
        return new Expression(ast);
    },
    AvoidingExpression(stuff) {
        const ast = stuff.ast();
        if (!ast.length) return astNode("String", "");
        if (ast.length === 1) return ast[0];
        return new Expression(ast);
    },
    Block(_1, _2, _3, statementList, _4, _5) {
        return new Program(statementList.ast().list.flat());
    },
    String(s) {
        return s.ast();
    },
    String_expression(_1, inerts, _2) {
        const inertAST = inerts.ast();
        if (!inertAST.sep.length) return astNode("String", inerts.sourceString);
        const toConcat = inertAST.list
            .slice(1)
            .reduce(
                (p, c, i) => [
                    ...p,
                    ...filterString(inertAST.sep[i]),
                    ...filterString(c),
                ],
                filterString(inertAST.list[0])
            );
        if (!toConcat.length) return astNode("String", "");
        if (toConcat.length === 1) return astNode("String", toConcat[0]);
        return astNode("StringConcat", toConcat);
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
        return {
            list: [first.ast(), ...rest.ast()],
            sep: sep.ast(),
        };
    },
    EmptyListOf() {
        return { list: [], sep: null };
    },
    unparsed(stuff) {
        return new UnparsedExpression(stuff.sourceString);
    },
    avoidingunparsed(stuff) {
        return new UnparsedExpression(stuff.sourceString);
    },
    newline(_1, _2, _3) {
        return [];
    },
    _terminal() {
        return [];
    },
});

const filterString = (stringASTNode) => {
    if (stringASTNode.type !== "String") return stringASTNode;
    return stringASTNode.args[0].length === 0 ? [] : [stringASTNode];
};

const makeAST = (sourceCode) => {
    const match = grammar.match(sourceCode);
    if (!match.succeeded()) throw new Error(match.message);
    return astBuilder(match).ast();
};

const astNode = (type, ...args) => {
    return { type, args };
};

module.exports = makeAST;

if (!module.parent) {
    inspect(
        makeAST(
            "f = fn:\n→\n    x -> x + 5\n    y -> y + 6\n←\npenis; vagina; james"
        )
    );
}
