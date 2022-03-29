require('colors');

const ASTNodeCleanFuncs = {
    Program: (node, scope) => {
        const oVars = deepCopy(scope.vars);

        let newStatements = [];
        node.statements.forEach((statement) => {
            if (scope.break || scope.continue || scope.infiniteLoop) return;
            const newStatement = clean(statement, scope);
            if (newStatement.dontInclude) return;

            if (newStatement.ASTType === "Program") newStatements.push(...newStatement.statements);
            else newStatements.push(newStatement);
        });
        node.statements = newStatements;

        // purge any new variables
        scope.vars = Object.keys(scope.vars).reduce((p, c) => (oVars[c] ? {...p, c } : p), {});
    },
    Assignment: (node, scope) => {
        node.assignments.forEach((assignment, i) => {
            node.assignments[i] = clean(assignment, scope);
        });
        if (node.assignments.length === 1) return node.assignments[0];
    },
    SingleAssignment: (node, scope) => {
        node.value = clean(node.value, scope);
        if (scope.vars[node.assignee]) {
            if (!isOfType(node.value, scope.vars[node.assignee].type)) throw `Compile Error: ${inspect(node.value)} does not match ${scope.vars[node.assignee].type}`;
            if (scope.vars[node.assignee].constant) throw `Compile Error: Cannot change read-only variable ${node.assignee}`;
            // if (deepEquals(node.value, scope.vars[node.assignee])) if they are equal then it should still be constant but this is weird to do
        }
        node.value.constant = node.constant;
        scope.vars[node.assignee] = node.value;
    },
    Reassignment: (node, scope) => {
        if (!scope.vars[node.assignee]) throw `Compile Error: ${node.assignee} doesn't exist!`;
        return clean({ ASTType: 'SingleAssignment', assignee: node.assignee, value: { ASTType: 'UnparsedExp', atoms: [node.assignee, node.op, node.value] } }, scope);
    },
    Print: (node, scope) => {
        try {
            node.value = clean(node.value, scope, "String");
        } catch (e) {
            // uh
        }

        try {
            node.value = clean(node.value, scope, "Primitive");
        } catch (e) {
            // uh
        }

        node.value = clean(node.value, scope);
    },
    If: (node, scope) => {
        node.test = clean(node.test, scope, "Bool");
        if (!node.test.unevaluated) {
            if (node.test.value) return clean(node.ifTrue, scope);
            if (node.ifFalse) return clean(node.ifFalse, scope);
            node.dontInclude = true;
            return;
        }
        const tScope = deepCopy(scope);
        const fScope = deepCopy(scope);
        node.ifTrue = clean(node.ifTrue, tScope);
        node.ifFalse = clean(node.ifFalse, fScope);

        scope.break = tScope.break && fScope.break;
        scope.canBreak = tScope.break || fScope.break;

        scope.continue = tScope.continue && fScope.continue;
        scope.canContinue = tScope.continue || fScope.continue;
    },
    Switch: (node, scope) => {},
    Catch: (node, scope) => {},
    For: (node, scope) => {},
    While: (node, scope) => {
        node.test = clean(node.test, scope, "Bool");

        const oInLoop = scope.inLoop;
        scope.inLoop = true;
        node.statements = clean(node.statements, scope);
        scope.inLoop = oInLoop;

        let breakout = false;

        if (!node.test.unevaluated) {
            if (!node.test.value) {
                node.dontInclude = true;
            } else {
                if (scope.break) breakout = true;
                else if (!scope.canBreak) scope.infiniteLoop = true;
            }
        }

        scope.break = false;
        scope.continue = false;
        scope.canBreak = false;
        scope.canContinue = false;

        if (breakout) return node.statements;
        if (!node.test.unevaluated && node.test.value) return { ASTType: "Repeat", statements: node.statements };
    },
    Repeat: (node, scope) => {
        let breakout = false;

        const oInLoop = scope.inLoop;
        scope.inLoop = true;
        node.statements = clean(node.statements, scope);
        scope.inLoop = oInLoop;

        if (!node.count) {
            if (scope.break) breakout = true;
            else if (!scope.canBreak) scope.infiniteLoop = true;
        } else {
            node.count = clean(node.count, scope);
            if (!node.count.unevaluated && (scope.callback || !scope.inLoop)) {
                if (node.count.value <= 0) node.dontInclude = true;
                else if (!Number.isFinite(node.count.value)) {
                    if (scope.break) breakout = true;
                    else if (!scope.canBreak) scope.infiniteLoop = true;
                }
            }
        }
        scope.break = false;
        scope.continue = false;
        scope.canBreak = false;
        scope.canContinue = false;

        if (breakout) return node.statements;
    },
    Put: (node, scope) => {
        node.value = clean(node.value, scope);
    },
    Return: (node, scope) => {
        if (!scope.canReturn) throw "Can only return from inside of a method!";
        node.value = clean(node.value, scope);
        scope.break = true;
    },
    Break: (node, scope) => {
        if (!scope.inLoop) throw "Can only break from inside loop!";
        scope.break = true;
    },
    Continue: (node, scope) => {
        if (!scope.inLoop) throw "Can only continue from inside loop!";
        if (scope.last) node.dontInclude = true;
        scope.continue = true;
    },

    UnparsedExp: (node, scope) => {
        const cleanedAtoms = node.atoms.map(atom => clean(atom, scope));
        const exp = parseExpression(cleanedAtoms, scope);

        if (exp.error) {
            throw exp.error;
        }

        return preEvaluateExpression(exp);
    },

    List: (node, scope) => {
        return { type: "List", values: node.values.map(value => clean(value, scope)) };
    },
    Tuple: (node, scope) => {},
    Set: (node, scope) => {},
    DiscreteRange: (node, scope) => {},
    ContinuousRange: (node, scope) => {},
    Function: (node, scope) => {},
    Process: (node, scope) => {},
    PatternBlock: (node, scope) => {},
    Pattern: (node, scope) => {},
    PatternElem: (node, scope) => {},
    Bool: (node, scope) => {
        return { type: "Bool", value: node.value };
    },
    Num: (node, scope) => {
        return readjustNum(node.value);
    },
    String: (node, scope) => {
        return { type: "String", value: node.value };
    },
    Concat: (node, scope) => {
        const newStrings = [];
        let currentString = "";
        node.strings.forEach((string, i) => {
            const newString = clean(string, scope);
            if (!newString.unevaluated) {
                currentString += toString(newString, false, false);
            } else {
                if (currentString.length > 0) newStrings.push({ type: "String", value: currentString });
                currentString = "";
                newStrings.push(newString);
            }
        });

        if (currentString.length > 0) newStrings.push({ type: "String", value: currentString });

        if (newStrings.length === 0) return { type: "String", value: "" };
        if (newStrings.length === 1) return newStrings[0];
        return { type: "String", unevaluated: { args: [], hardEval: true, evaluate: () => newStrings.reduce((p, string) => p + evaluate(string, {...scope, expectedType: "String" }).value, '') } };
    },
    ElementOf: (node, scope) => {},
}

const evaluate = () => {};

const BASE_SCOPE = { vars: require('./default_vars'), patterns: require('./default_patterns') };

const { isOfType, readjustNum } = require('./default_types');
const { hash, deepCopy, makeIterator, inspect, toString, print, deepEquals } = require('./utils');
const { parseExpression, evaluateExpression, preEvaluateExpression } = require('./parse_expression');

const makeAST = require("./make_AST");
const verifyScope = require('./verify_scope');

const clean = (node, scope, expectedType = "Object") => {
    if (!node) throw "Node is undefined!"
    const oExpectedType = scope.expectedType;
    scope.expectedType = expectedType;
    if (node.ASTType) {
        const cleanedNode = ASTNodeCleanFuncs[node.ASTType](node, scope);
        scope.expectedType = oExpectedType;
        if (cleanedNode) return cleanedNode;
    }
    scope.expectedType = oExpectedType;
    return node;
};

module.exports = (text) => {
    const ast = makeAST(text);
    // verifyScope(ast);
    const scope = BASE_SCOPE;
    const cleanAST = clean(ast, scope);

    if (scope.error) return scope.error.magenta + '\n';
    const inspected = inspect(cleanAST, true);
    return inspected;
    // return LZUTF8.compress(inspected, { outputEncoding: "StorageBinaryString" });
}

const LZUTF8 = require('lzutf8');

require('./run_file')(module);