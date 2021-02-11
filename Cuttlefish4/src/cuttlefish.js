const ASTNodeEvals = {
    Program: (node, scope = {}) => {
        const vars = scope.vars ? Object.keys(scope.vars) : [];
        for (const statement of node.statements) {
            evaluate(statement, scope);
            if (scope.return || scope.break || scope.continue) break;
        }
        // get rid of any new vars
    },
    Assignment: (node, scope) => {
        let prevScope = scope;
        for (const assignment of node.assignments) {
            scope.vars = {...scope.vars, ...evaluate(assignment, prevScope) };
        }
    },
    SingleAssignment: (node, scope) => {
        // need to do type check in parser
        return {
            [node.assignee.id]: evaluate(node.value, scope)
        };
    },
    Reassignment: (node, scope) => {
        //need to do type check in parser
        scope.vars = {...scope.vars, [node.assignee.id]: evaluate({ ASTType: "BinaryOp", op: node.op, left: evaluate(node.assignee, scope), right: evaluate(node.value, scope) }, scope) };
    },
    Print: (node, scope) => {
        // need to do type check
        console.log(evaluate(node.value, scope).value);
    },
    If: (node, scope) => {
        // type check
        if (evaluate(node.test, scope))
            evaluate(node.ifTrue, scope);
        else evaluate(node.ifFalse, scope);
    },
    Catch: (node, scope) => {
        if (scope.error) {
            node.patterns.forEach((pattern) => evaluate(pattern, {...scope, vars: {...scope.vars, $: scope.error } }));
        }
    },
    For: (node, scope) => {
        // typecheck for iterable
        const iterator = evaluate(node.collection, scope);
        while (iterator.hasNext) {
            scope.vars.$ = iterator.next();
            const pscope = deepCopy(scope);
            let matched = false;
            for (const pattern of node.patterns) {
                if (evaluate(pattern, pscope)) {
                    scope = pscope;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                scope.error = { ObjectType: "PatternMatchException", message: `Argument ${iterator.current} did not match any pattern` };
                break;
            }
            if (scope.break) break;
            if (scope.return) return scope.put[scope.put.length - 1];
        }
    },
    While: (node, scope) => {
        while (evaluate(node.test, scope).value) {
            evaluate(node.statements, scope);
            if (scope.break) break;
            if (scope.return) return scope.put[scope.put.length - 1];
        }
    },
    Repeat: (node, scope) => {
        const count = evaluate(node.count, scope);
        let i = count.value || -1;
        while (i !== 0) {
            evaluate(node.statements, scope);
            if (scope.break) break;
            if (scope.return) return scope.put[scope.put.length - 1];
            i--;
        }
    },
    Put: (node, scope) => {
        scope.put.push(evaluate(node.value, scope));
    },
    Return: (node, scope) => {
        if (node.value) scope.put.push(evaluate(node.value, scope));
        scope.return = true;
    },
    Break: (node, scope) => {
        scope.break = true;
    },
    Continue: (node, scope) => {
        scope.continue = true;
    },

    Ternary: (node, scope) => {
        if (evaluate(node.test, scope).value) return evaluate(node.ifTrue, scope);
        return evaluate(node.ifFalse, scope);
    },
    BinaryOp: (node, scope) => {
        return [node.left, node.right].reduce((pScope, n) => verify(n, pScope), scope);
    },
    Application: (node, scope) => {
        return [node.func, ...node.input].reduce((pScope, n) => verify(n, pScope), scope);
    },
    List: (node, scope) => {
        // need to do type check
        return { ObjectType: "List", values: node.values.map(value => evaluate(value, scope)) };
    },
    Tuple: (node, scope) => {
        return { ObjectType: "Tuple", values: node.values.map(value => evaluate(value, scope)) };
    },
    Set: (node, scope) => {
        return { ObjectType: "Set", values: node.values.reduce((set, value) => ({...set, [hash(value)]: evaluate(value, scope) }), {}) };
    },
    DiscreteRange: (node, scope) => {
        const start = evaluate(node.start, scope);
        const step = evaluate(node.step, scope) || { ObjectType: "Int", value: 1 };
        const end = evaluate(node.end, scope) || { ObjectType: "Int", value: Number.MAX_SAFE_INTEGER };

        if (end.value === start.value || step.value === 0) throw "UHHHH I CAN PROBABLY MAKE THIS WORK AT SOME POINT";

        const iterator = {
            ObjectType: "Iterator",
            next() {
                if (!this.hasNext) {
                    console.log("Does not have a next!");
                    return;
                }
                if (!this.current) { // this might be able to be cleaned up
                    this.current = start;
                    if (!node.includeStart) this.current.value += step.value;
                } else this.current.value += step.value;
                this.hasNext = node.includeEnd ? (this.current.value + step.value) * step.value <= step.value * end.value : (this.current.value + step.value) * step.value < step.value * end.value;
                return { current: this.current, hasNext: this.hasNext };
            }
        };

        if (node.includeStart) iterator.hasNext = true;
        else if ((end.value - start.value) * step.value < 0)
            iterator.hasNext = false;
        else iterator.hasNext = node.includeEnd ? (start.value + step.value) * step.value <= step.value * end.value : (start.value + step.value) * step.value < step.value * end.value;

        return iterator;
    },
    ContinuousRange: (node, scope) => {
        return {
            ObjectType: "Testable",
            test: value => {
                // this can be shrunk
                if (node.start) {
                    if (node.includeStart && value.value < evaluate(node.start, scope).value)
                        return false;
                    if (!node.includeStart && value.value <= evaluate(node.start, scope).value)
                        return false;
                }

                if (node.end) {
                    if (node.includeEnd && value.value > evaluate(node.end, scope).value)
                        return false;
                    if (!node.includeEnd && value.value >= evaluate(node.end, scope).value)
                        return false;
                }

                return true;
            }
        }
    },
    Function: (node, scope) => {
        return { ObjectType: "Function", patterns: node.patterns };
    },
    Process: (node, scope) => {
        return { ObjectType: "Process", patterns: node.patterns };
    },
    Pattern: (node, scope) => {
        const pscope = node.input.reduce((passScope, patternelem) => verify(patternelem, passScope), scope);
        node.cases.forEach(pcase => verify(pcase, {...pscope, hasArgument: true }));
        verify(node.output, {...pscope, hasArgument: true });
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
        return { ObjectType: "Bool", value: node.value };
    },
    Num: (node, scope) => {
        return { ObjectType: node.value === Math.floor(node.value) ? "Int" : "Real", value: node.value };
    },
    String: (node, scope) => {
        return { ObjectType: "String", value: node.value };
    },
    Concat: (node, scope) => {
        return { ObjectType: "String", value: node.strings.reduce((p, string) => p + evaluate(string, scope).value, '') };
    },
    ElementOf: (node, scope) => {
        //
        verify(node.parent, scope);
        verify(node.childId, scope);
        return scope;
    },
    Ref: (node, scope) => {
        if (scope.vars && scope.vars[node.id]) return scope.vars[node.id];
        if (BASE_SCOPE.vars[node.id]) return BASE_SCOPE.vars[node.id];
        throw `AST Error: ID ${node.id} not found`;
    }
}

const hash = () => {};
const deepCopy = () => {};

const BASE_SCOPE = { vars: require('./default_scope') };
const makeAST = require("./make_AST");
const verifyScope = require('./verify_scope');

const evaluate = (node, scope) => {
    if (!node) return undefined;
    // console.log(node);
    if (node.ASTType) return ASTNodeEvals[node.ASTType](node, scope);
    throw "Was passed a node that either didnt exist or didnt have an ASTType!";
};

module.exports = text => {
    const ast = makeAST(text);
    verifyScope(ast);
    evaluate(ast);
    return '';
}

require('./run_file')(module);