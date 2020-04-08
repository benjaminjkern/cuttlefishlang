const DEBUG = false;

const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");
const basegrammar = ohm.grammar(
    fs.readFileSync(path.resolve(__dirname, "cuttlefish.ohm"))
);

const util = require("util");
const MacroHandler = require("../grammar/macro_parser.js");
const tokenize_indents = require("../grammar/tokenize_indents");

module.exports = (source) => {
    let context = MacroHandler.macroparse(source);
    let grammar = context2grammar(context);
    let match = grammar.match(tokenize_indents(source));

    if (match.failed() || DEBUG) {
        logTrace(grammar, match.message, source);
        return "";
    }

    /*
     * I only kinda get whats going on here
     *  |
     *  V
     */

    let nodeSpecs = {};
    Object.assign(nodeSpecs, defaultNodeSpecs);
    if (context.nodeSpecs) Object.assign(nodeSpecs, context.nodeSpecs);
    context.nodeSpecs = nodeSpecs;

    let baseNodeTemplate = { toString: defaultToString };
    Object.assign(baseNodeTemplate, defaultBaseNodeTemplate);
    if (context.baseNodeTemplate)
        Object.assign(baseNodeTemplate, context.baseNodeTemplate);
    context.baseNodeTemplate = baseNodeTemplate;
    Object.assign(context.baseNodeTemplate, defaultMethods.default);

    context.nodeConstructors = {};
    for (const [name, args] of Object.entries(context.nodeSpecs)) {
        context.nodeConstructors[name] = {};
        context.nodeConstructors[name].template = Object.create(
            context.baseNodeTemplate
        );
        context.nodeConstructors[name].template.type = name;
        context.nodeConstructors[name].construct = function() {
            let obj = Object.create(context.nodeConstructors[name].template);
            obj.fields = {};
            args.map((x, i) => {
                obj.fields[x] = arguments[i];
            });
            return obj;
        };
    }
    for (const [name, contents] of Object.entries(defaultMethods)) {
        if (name !== "default")
            Object.assign(context.nodeConstructors[name].template, contents);
    }

    const node = (type, ...args) =>
        context.nodeConstructors[type].construct(...args);

    const defaultASTOperations = {
        Specification: (_1, head, _2, tail, _3) =>
            node(
                "Specification", [head, tail].map((x) => x.ast())
            ),
        Statement_assignment: (pattern, _1, exp) =>
            node("AssignmentStatement", pattern.ast(), exp.ast()),
        Statement_print: (_1, exp) => node("PrintStatement", exp.ast()),
        Statement_put: (_1, exp) => node("PutStatement", exp.ast()),
        Block_small: (list, _1, _2) => node("SmallBlock", list.ast()),
        Block_large: (_1, _2, _3, head, _4, _5, tail, _6, _7, _8, _9) =>
            node(
                "LargeBlock", [head, tail].map((x) => x.ast())
            ),
        Pattern: (list) => node("Pattern", list.ast()),
        PatternElement: (atom) => node("AtomicPattern", atom.ast()),
        PatternElement_tuple: (_1, contents, _2) =>
            node("TuplePattern", contents.ast()),
        PatternElement_list: (list_type, head, _1, tail) =>
            node("ListPattern", list_type.ast(), head.ast(), tail.ast()),
        PatternElement_typed: (type, patternElem) =>
            node("TypedPattern", type.ast(), patternElem.ast()),
        Type: (id) => node("Type", id.ast()),
        Type_tuple: (_1, block, _2) => node("TupleType", block.ast()),
        Type_function: (type_in, _1, type_out) =>
            node("FunctionType", type_in.ast(), type_out.ast()),
        Type_list: (list_type) => list_type.ast(),
        ListType: (_1, type, _2) => node("ListType", type.ast()),
        SubRoutineGroup: (srgblock) => node("SubRoutineGroup", srgblock.ast()),
        SubRoutineGroup_singular: (stmtblock) =>
            node("SingularSubRoutineGroup", stmtblock.ast()),
        Routine: (subroutine) => subroutine.ast(),
        Function: (_1, _2, subroutine_group) =>
            node("FunctionGroup", subroutine_group.ast()),
        Process: (_1, _2, subroutine_group) =>
            node("ProcessGroup", subroutine_group.ast()),
        Server: (_1, _2, subroutine_group) =>
            node("ServerGroup", subroutine_group.ast()),
        SubRoutine: (pattern, _1, guard, _2, block) =>
            node("SubRoutine", pattern.ast(), guard.ast(), block.ast()),
        Expression: (atom_list) =>
            node(
                "Expression",
                atom_list.map((x) => x.ast())
            ),
        Atom: (contents) => contents.ast(),
        Atom_singleton: (_1, exp, _2) => node("GroupedExpression", exp.ast()),
        AbstractType: (type, _1, _2, block) =>
            node("AbstractType", type.ast(), block.ast()),
        DataPattern: (pattern, _1, block) =>
            node("DataPattern", pattern.ast(), block.ast()),
        Select: (object, selector) => node("Select", object.ast(), selector.ast()),
        Selector: (list) => list.ast(),
        Selector_nonSlice: (_1, selectOp, _2) => selectOp.ast(),
        Tuple_nonempty: (_1, block, _2) => node("Tuple", block.ast()),
        List_num: (_1, start, _2, step, _3, end, _4) =>
            node("NumList", start.ast(), step.ast(), end.ast()),
        List_nonempty: (seq) => node("List", seq.ast()),
        index: (content) => content.ast(),
        String: (seq) => node("String", this.sourceString),
        String_interpolated: (_1, seq_head, _5, exp, _6, seq_tail, _10) =>
            node(
                "InterpolatedString", [seq_head, seq_tail].map((x) => x.ast()),
                exp.map((x) => x.ast())
            ),
        stringbit: (_1, _2, _3) => node("StringLiteral", this.sourceString),
        numlit: (_1, _2, _3, _4, _5, _6) =>
            node("NumberLiteral", this.sourceString),
        id: (contents) => node("Id", this.sourceString),
        NonemptyListOf: (head, sep, tail) => [head, tail].map((x) => x.ast()),
        nospaceops: (op) => node("Operator", this.sourceString),
    };
    let ast_operations = {};
    Object.assign(ast_operations, defaultASTOperations);
    if (context.ast_operations) {
        Object.assign(ast_operations, context.ast_operations);
    }
    context.ast_operations = ast_operations;

    let astBuilder = grammar
        .createSemantics()
        .addOperation("ast", context.ast_operations);
    let ast = astBuilder(match).ast();
    astArrayCleaner(ast);
    return ast;
};

function context2grammar(context) {
    return ohm.grammar(
        `CLG <: cuttlefish {
        ${[context.local, context.global, context.exlusive]
          .map(grammarEntryExpander)
          .join("\n")}
    }`, { cuttlefish: basegrammar }
    );
}

function grammarEntryExpander(category) {
    if (!category) {
        return "";
    }
    return category
        .entries()
        .map((entry) => {
            let [name, body] = entry;
            let inserter = body.inserter ? body.inserter : "+=";
            let constructor = body.constructor;
            return (
                `${name} ${inserter} ` +
                body
                .map((x) => {
                    if (!constructor) {
                        return `"${x}"`;
                    } else {
                        return `${constructor}<${x.join(",")}>`;
                    }
                })
                .join(" | ")
            );
        })
        .join("\n");
}

function logTrace(grammar, error, source) {
    console.log(error);
    let match = grammar.trace(tokenize_indents(source));
    fs.writeFile(
        path.resolve(__dirname, "../logs/grammarTrace.txt"),
        match.toString(),
        function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Trace written in logs");
            }
        }
    );
}

const defaultNodeSpecs = {
    Specification: ["body"],
    PrintStatement: ["exp"],
    PutStatement: ["exp"],
    SubRoutineAssignment: ["id", "subroutine"],
    AssignmentStatement: ["id", "exp"],
    Pattern: ["patternElems"],
    TuplePattern: ["contents"],
    ListPattern: ["list_type", "head", "tail"],
    TypePattern: ["type", "id"],
    AtomicPattern: ["id"],
    FunctionType: ["input_type", "output_type"],
    ListType: ["type"],
    Type: ["id"],
    SubRoutineGroup: ["subroutine_block"],
    SingularSubRoutineGroup: ["statement_block"],
    FunctionGroup: ["subroutine_group"],
    ProcessGroup: ["subroutine_group"],
    ServerGroup: ["subroutine_group"],
    Guard: ["exp"],
    Expression: ["atoms", "kwarg_block"],
    Kwarg: ["id", "exp"],
    GroupedExpressions: ["exps"],
    AbstractType: ["id", "pattern_block"],
    Select: ["subject", "predicate"],
    Tuple: ["contents"],
    NumList: ["start", "step", "end"],
    List: ["contents"],
    StringNode: ["contents"],
    MacroFlag: ["id"],
    Id: ["id"],
    Numlit: ["num"],
    SubRoutine: ["pattern", "guard", "statements"],
    Operator: ["op"],
};
const defaultBaseNodeTemplate = {};

function defaultToString() {
    return util.inspect(this, false, null, true);
}

function inspector(depth, options) {
    let obj = { type: this.type };
    Object.assign(obj, this.fields);
    return obj;
}

const defaultMethods = {
    default: {
        toString: defaultToString,
        [util.inspect.custom]: inspector,
    },
    Operator: {
        terminal: true,
    },
    Id: {
        terminal: true,
    },
    Numlit: {
        terminal: true,
    },
    StringNode: {
        terminal: true,
    },
};

function astArrayCleaner(ast) {
    if (ast === undefined || ast.terminal) {
        return;
    }
    for (const [key, val] of Object.entries(ast.fields)) {
        if (Array.isArray(val)) {
            ast.fields[key] = ast.fields[key].flat();
            ast.fields[key].map((x) => astArrayCleaner(x));
        } else {
            astArrayCleaner(val);
        }
    }
}