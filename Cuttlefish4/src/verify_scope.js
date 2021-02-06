const ASTNodeVerifications = {
    Program: (node, scope = {}) => {
        let prevScope = scope;
        for (const statement of node.statements) {
            prevScope = verify(statement, prevScope) || prevScope;
        }
        if (prevScope.callback) {
            const { callback, ...withoutCallback } = prevScope;
            prevScope = withoutCallback;
            callback.filter(c => c).forEach(callbackFn => callbackFn(prevScope));
        }
        return prevScope;
    },
    Assignment: (node, scope) => {
        let prevScope = scope;
        let addedVars = {};
        for (const assignment of node.assignments) {
            if (addedVars[assignment.assignee.id]) throw "Cannot set the same var twice!";
            addedVars[assignment.assignee.id] = true;
            prevScope = verify(assignment, prevScope) || prevScope;
        }
        return prevScope;
    },
    SingleAssignment: (node, scope) => {
        return {...verify(node.value, scope),
            vars: {...scope.vars, [node.assignee.id]: true },
        };
    },
    Reassignment: (node, scope) => {
        verify(node.assignee, scope);
        return verify(node.value, scope);
    },
    Print: (node, scope) => {
        return verify(node.value, scope);
    },
    If: (node, scope) => {
        verify(node.ifTrue, scope);
        verify(node.ifFalse, scope);
        return verify(node.test, scope);
    },
    Catch: (node, scope) => {
        node.patterns.forEach((pattern) => verify(pattern, scope));
        verify(node.output, scope);
    },
    For: (node, scope) => {
        node.patterns.forEach((pattern) => verify(pattern, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 }));
        verify(node.output, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return verify(node.collection, scope);
    },
    While: (node, scope) => {
        verify(node.statements, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return scope;
    },
    Repeat: (node, scope) => {
        if (node.count) verify(node.count, scope);
        verify(node.statements, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return scope;
    },
    Put: (node, scope) => {
        return verify(node.value, scope);
    },
    Return: (node, scope) => {
        if (!scope.inFunction) throw "AST Error: Can only return from inside of a function or process!";
        return verify(node.value, scope);
    },
    Break: (node, scope) => {
        if (!scope.loopCount) throw "AST Error: Can only break from inside of a loop!";
    },
    Continue: (node, scope) => {
        if (!scope.loopCount) throw "AST Error: Can only continue from inside of a loop!";
    },

    Ternary: (node, scope) => {
        return [node.test, node.ifTrue, node.ifFalse].reduce((pScope, n) => verify(n, pScope), scope);
    },
    BinaryOp: (node, scope) => {
        return [node.left, node.right].reduce((pScope, n) => verify(n, pScope), scope);
    },
    Application: (node, scope) => {
        return [node.func, ...node.input].reduce((pScope, n) => verify(n, pScope), scope);
    },
    List: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Tuple: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Set: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Map: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, scope));
        return scope;
    },
    DiscreteRange: (node, scope) => {
        return [node.values, node.end, node.step].reduce((pScope, n) => verify(n, pScope), scope);
    },
    ContinuousRange: (node, scope) => {
        return [node.values, node.end].reduce((pScope, n) => verify(n, pScope), scope);
    },
    Function: (node, scope) => {
        return {...scope,
            callback: [...(scope.callback || []), (callbackScope) => {
                node.patterns.forEach(pattern => verify(pattern, {...callbackScope, inFunction: true, loopCount: 0 }));
                verify(node.output, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
    Process: (node, scope) => {
        return {...scope,
            callback: [...(scope.callback || []), (callbackScope) => {
                node.patterns.forEach(pattern => verify(pattern, {...callbackScope, inFunction: true, loopCount: 0 }));
                verify(node.output, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
    Pattern: (node, scope) => {
        const pscope = node.input.reduce((passScope, patternelem) => verify(patternelem, passScope), scope);
        node.cases.forEach(pcase => verify(pcase, pscope));
        verify(node.output, pscope);
        return scope;
    },
    Case: (node, scope) => {
        node.cases.forEach(pcase => verify(pcase, scope));
        verify(node.output, scope);
        return verify(node.test, scope);
    },
    PatternElem: (node, scope) => {
        let newScope = scope;
        if (node.type) newScope = verify(node.type, scope);
        if (node.default) newScope = verify(node.default, scope);
        return {...newScope,
            vars: {...scope.vars, [node.id]: true }
        }
    },
    ListType: (node, scope) => verify(node.type, scope),
    Bool: (node, scope) => {
        if (![true, false].includes(node.value)) throw "AST Error: Received Number ASTNode with non-Number value";
        return scope;
    },
    Num: (node, scope) => {
        if (Number.isNaN(node.value)) throw "AST Error: Received Number ASTNode with non-Number value";
        return scope;
    },
    String: (node, scope) => {
        if (typeof node.value !== 'string') throw "AST Error: Received String ASTNode with non-String value";
        return scope;
    },
    Concat: (node, scope) => {
        node.strings.forEach(string => verify(string, scope));
        return scope;
    },
    ElementOf: (node, scope) => {
        verify(node.parent, scope);
        verify(node.childId, scope);
        return scope;
    },
    Ref: (node, scope) => {
        if ((scope.vars && scope.vars[node.id]) || BASE_SCOPE[node.id]) return scope;
        throw `AST Error: ID ${node.id} not found`;
    }
}

const verify = (node, scope) => {
    if (!node) return scope;
    if (node.ASTType) return ASTNodeVerifications[node.ASTType](node, scope);
    throw "cannot verify node without ASTType!";
}

const makeAST = require("./make_AST");

const BASE_SCOPE = { Int: true, Num: true, Bool: true, String: true, true: true, false: true };

module.exports = text => verify(makeAST(text), {});

require('./run_file')(module);


const getType = (node, scope) => {

}