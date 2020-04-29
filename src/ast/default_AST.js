module.exports = macroContext => {
    const node = (type, ...args) =>
        macroContext.nodeConstructors[type].construct(...args);
    return {
        Specification(_1, head, _2, tail, _3) {
            return node(
                "Specification", [head, tail].map((x) => x.ast())
            )
        },
        Statement_assignment(pattern, _1, exp) {
            return node("AssignmentStatement", pattern.ast(), exp.ast())
        },
        Statement_print(_1, exp) { return node("PrintStatement", exp.ast()) },
        Statement_put(_1, exp) { return node("PutStatement", exp.ast()) },
        Block_small(list, _1, _2) { return list.ast() },
        Block_large(_1, _2, _3, head, _4, _5, tail, _6, _7, _8, _9) { return [head, tail].map((x) => x.ast()) },
        Pattern(list) { return node("Pattern", list.ast()) },
        PatternElement(atom) { return node("AtomicPattern", atom.ast()) },
        PatternElement_tuple(_1, contents, _2) {
            return node("TuplePattern", contents.ast())
        },
        PatternElement_list(list_type, head, _1, tail) { return node("ListPattern", list_type.ast(), head.ast(), tail.ast()) },
        PatternElement_typed(type, patternElem) { return node("TypePattern", type.ast(), patternElem.ast()) },
        Type(id) { return node("Type", id.ast()) },
        Type_tuple(_1, block, _2) { return node("TupleType", block.ast()) },
        Type_function(type_in, _1, type_out) { return node("FunctionType", type_in.ast(), type_out.ast()) },
        Type_list(list_type) { return list_type.ast() },
        ListType(_1, type, _2) { return node("ListType", type.ast()) },
        SubRoutineGroup(srgblock) { return node("SubRoutineGroup", srgblock.ast()) },
        SubRoutineGroup_singular(stmtblock) { return node("SingularSubRoutineGroup", stmtblock.ast()) },
        Routine(subroutine) { return subroutine.ast() },
        Function(_1, _2, subroutine_group) { return node("FunctionGroup", subroutine_group.ast()) },
        Process(_1, _2, subroutine_group) { return node("ProcessGroup", subroutine_group.ast()) },
        Server(_1, _2, subroutine_group) { return node("ServerGroup", subroutine_group.ast()) },
        SubRoutine(pattern, _1, guard, _2, returnTypeList, _3, _4, block) { return node("SubRoutine", pattern.ast(), guard.ast(), returnTypeList.map ? returnTypeList.map(x => x.ast()) : returnTypeList.ast(), block.ast()) },
        Expression(atom_list) {
            return node(
                "Expression",
                atom_list.ast()
            )
        },
        Atom(contents) { return contents.ast() },
        Atom_singleton(_1, exp, _2) { return node("Expression", exp.ast()) },
        AbstractType(type, _1, _2, block) { return node("AbstractType", type.ast(), block.ast()) },
        DataPattern(pattern, _1, block) { return node("DataPattern", pattern.ast(), block.ast()) },
        Select(object, selector) { return node("Select", object.ast(), selector.ast()) },
        Selector(list) { return list.ast() },
        Selector_nonSlice(_1, selectOp, _2) { return selectOp.ast() },
        Tuple_nonempty(_1, block, _2) { return node("Tuple", block.ast()) },
        Tuple_empty(_1, _2) { return node("Tuple", []) },
        List_num(_1, start, _2, step, _3, end, _4) { return node("NumList", start.ast(), step.ast(), end.ast()) },
        List_nonempty(_1, seq, _2) { return node("List", seq.ast()) },
        List_empty(_1, _2) { return node("List", []) },
        index(content) { return content.ast() },
        String(seq) { return node("String", this.sourceString) },
        String_interpolated(_1, seq_head, _5, exp, _6, seq_tail, _10) {
            return node(
                "InterpolatedString", [seq_head, seq_tail].map((x) => x.ast()),
                exp.map((x) => x.ast())
            )
        },
        stringbit(_3) { return node("String", this.sourceString) },
        numlit(_1, _2, _3, _4, _5, _6) {
            return node("Numlit", this.sourceString)
        },
        id(contents) { return node("Id", this.sourceString) },
        NonemptyListOf(head, sep, tail) { return [head, tail].map((x) => x.ast()) },
        nospaceops(op) { return node("Operator", this.sourceString) },
    }
};