require('colors');

const ASTNodeEvals = {
    Program: (node, scope = { vars: {} }) => {
        const vars = Object.keys(scope.vars);
        for (const statement of node.statements) {
            evaluate(statement, scope);
            if (scope.return || scope.break || scope.continue || scope.error) break;
        }
        // purge any in-scope variables - need to fix
        // scope.vars = Object.keys(scope.vars).filter(v => vars[v]).reduce((p, c) => ({...p, [c]: vars[c] }), {});
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
        scope.vars = {...scope.vars, [node.assignee.id]: evaluate({ ASTType: "BinaryOp", op: node.op, left: node.assignee, right: node.value }, scope) };
    },
    Print: (node, scope) => {
        // need to do type check
        // need to abstract this to a toString method
        const toPrint = evaluate(node.value, scope);
        // console.log(toPrint);
        switch (toPrint.ObjectType) {
            case 'List':
                console.log(toPrint.values.map(a => a.value));
                break;
            case 'Iteratable':
                process.stdout.write("[ ");
                while (toPrint.hasNext) {
                    const item = toPrint.next().current;
                    if (matchType(item, "Num") || matchType(item, "Bool"))
                        process.stdout.write((item.value + '').yellow);
                    else if (matchType(item, "String"))
                        process.stdout.write(("'" + item.value + "'").green);
                    else process.stdout.write(item.value + '');
                    if (toPrint.hasNext) process.stdout.write(", ");
                }
                process.stdout.write(" ]\n");
                break;
            case 'Set':
                console.log("{ " + Object.keys(toPrint.values).map(key => {
                    const item = toPrint.values[key]
                    if (matchType(item, "Num") || matchType(item, "Bool"))
                        return (item.value + '').yellow;
                    if (matchType(item, "String"))
                        return ("'" + item.value + "'").green;
                    return item.value + '';
                }).join(", ") + " }");
                break;
            default:
                if (toPrint.value !== undefined) console.log(toPrint.value);
                else if (toPrint.ObjectType) console.log(`[ ${toPrint.ObjectType} ]`)
                else console.log("[ Object ]");
        }
    },
    If: (node, scope) => {
        // type check
        if (evaluate(node.test, scope).value)
            evaluate(node.ifTrue, scope);
        else evaluate(node.ifFalse, scope);
    },
    Switch: (node, scope) => {

    },
    Catch: (node, scope) => {
        if (scope.error) {
            const oldArg = scope.vars.$;
            scope.vars.$ = scope.error;
            evaluate(node.patterns, scope);
            scope.error = undefined;
            scope.vars.$ = oldArg;
        }
    },
    For: (node, scope) => {
        // typecheck for iterable
        let iterator = evaluate(node.collection, scope);
        if (iterator.ObjectType === "List") iterator = makeIterator(iterator);
        const oldArg = scope.vars.$;
        while (iterator.hasNext) {
            scope.vars.$ = deepCopy(iterator.next().current);
            evaluate(node.patterns, scope);
            if (scope.break || scope.return || scope.error) break;
        }
        scope.vars.$ = oldArg;
    },
    While: (node, scope) => {
        while (evaluate(node.test, scope).value) {
            evaluate(node.statements, scope);
            if (scope.break || scope.return || scope.error) break;
        }
    },
    Repeat: (node, scope) => {
        const count = evaluate(node.count, scope);
        let i = count.value;
        // type check int greater than 0
        while (i > 0) {
            evaluate(node.statements, scope);
            if (scope.break) break;
            if (scope.return) return scope.put[scope.put.length - 1];
            i--;
        }
    },
    Put: (node, scope) => {
        const value = evaluate(node.value, scope);
        if (scope.put)
            scope.put.push(value);
        else scope.put = [value];
    },
    Return: (node, scope) => {
        if (node.value) {
            const value = evaluate(node.value, scope);
            if (scope.put)
                scope.put.push(value);
            else scope.put = [value];
        }
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
        return BinaryOpEvals[node.op](evaluate(node.left, scope), evaluate(node.right, scope));
    },
    UnaryOp: (node, scope) => {
        return UnaryOpEvals[node.op](evaluate(node.exp, scope));
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
        return {
            ObjectType: "Set",
            values: node.values.reduce((set, value) => {
                const evaluated = evaluate(value, scope);
                return {...set, [hash(evaluated)]: evaluated }
            }, {})
        };
    },
    DiscreteRange: (node, scope) => {
        const start = evaluate(node.start, scope);
        const step = evaluate(node.step, scope) || { ObjectType: "Int", value: 1 };
        const end = evaluate(node.end, scope) || { ObjectType: "Int", value: Number.MAX_SAFE_INTEGER };

        if (end.value === start.value || step.value === 0) throw "UHHHH I CAN PROBABLY MAKE THIS WORK AT SOME POINT";

        const iterator = {
            ObjectType: "Iteratable",
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
    PatternBlock: (node, scope) => {
        for (const pattern of node.patterns) {
            const pscope = deepCopy(scope);
            if (!pattern.input.length || (evaluate(pattern.input[0], pscope) && pattern.tests.every(test => evaluate(test, pscope).value))) {
                scope.vars = pscope.vars;
                evaluate(pattern, scope);
                return;
            }
        }
        scope.error = { ObjectType: "PatternMatchException", message: `Argument ${inspect(scope.vars.$)} did not match any pattern` };
    },
    Pattern: (node, scope) => {
        // scope = node.input.reduce((passScope, patternelem) => evaluate(patternelem, passScope), scope);
        // for (const case of node.cases) {
        //     if (evaluate(case, scope)) {
        //         scope = pscope;
        //         break;
        //     }
        // }
        evaluate(node.output, scope);
    },
    PatternElem: (node, scope) => {
        // const type = evaluate(node.type, scope);
        // const default = evaluate(node.default, scope);
        // TODO: FIX
        // console.log("$" + scope.vars.$)
        if (!node.type || scope.vars.$.ObjectType === node.type.id || typeof scope.vars.$ === 'object') {
            scope.vars[node.id] = scope.vars.$;
            return true;
        }
        return false;
    },
    ListType: (node, scope) => ({ ObjectType: "Type", type: "List", listType: evaluate(node.type, scope) }),
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
        // i have no idea
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

const BASE_SCOPE = { vars: require('./default_vars') };

const { hash, deepCopy, makeIterator, inspect } = require('./utils');

const makeAST = require("./make_AST");
const verifyScope = require('./verify_scope');

const evaluate = (node, scope) => {
    if (!node) return undefined;
    // console.log(node);
    // console.log(scope);
    if (node.ASTType) return ASTNodeEvals[node.ASTType](node, scope);
    throw "Was passed a node that either didnt exist or didnt have an ASTType!";
};

module.exports = text => {
    const ast = makeAST(text);
    verifyScope(ast);
    const scope = { vars: {} };
    evaluate(ast, scope);

    if (scope.error) return scope.error;
    return '';
}

require('./run_file')(module);