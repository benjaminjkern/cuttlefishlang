module.exports = macroContext => {
    const node = (type, ...args) =>
        macroContext.nodeConstructors[type].construct(...args);
    const line_number = (node,source) => {
        if(node.type == "Specification"){
            node.line_ends = [...source.sourceString.matchAll("\n")].map(x=>x.index)
        }
        node.sourceIdx = source.startIdx
        return node
    }
    return {
        Specification(_1, head, _2, tail, _3) {
            return line_number(node(
                "Specification", [head, tail].map((x) => x.ast())
            ),this.source)
        },
        Statement_assignment(pattern, _1, exp) {
            return node("AssignmentStatement", pattern.ast(), exp.ast())
        },
        Statement_print(_1, exp) { return line_number(node("PrintStatement", exp.ast()),this.source) },
        Statement_put(_1, exp) { return line_number(node("PutStatement", exp.ast()),this.source) },
        Block_small(list, _1, _2) { return list.ast() },
        Block_large(_1, _2, _3, head, _4, _5, tail, _6, _7, _8, _9) { return [head, tail].map((x) => x.ast()) },
        Pattern(list) { return line_number(node("Pattern", list.ast()),this.source) },
        PatternElement(atom) { return line_number(node("AtomicPattern", atom.ast()),this.source) },
        PatternElement_tuple(_1, contents, _2) {
            return line_number(node("TuplePattern", contents.ast()),this.source)
        },
        PatternElement_list(list_type, head, _1, tail) { return line_number(node("ListPattern", list_type.ast(), head.ast(), tail.ast()),this.source) },
        PatternElement_typed(type, patternElem) { return line_number(node("TypePattern", type.ast(), patternElem.ast()),this.source) },
        Type(id) { return line_number(node("Type", id.ast()),this.source) },
        Type_tuple(_1, block, _2) { return line_number(node("TupleType", block.ast()),this.source) },
        Type_function(type_in, _1, type_out) { return line_number(node("FunctionType", type_in.ast(), type_out.ast()),this.source) },
        Type_list(list_type) { return list_type.ast() },
        ListType(_1, type, _2) { return line_number(node("ListType", type.ast()),this.source) },
        SubRoutineGroup(srgblock) { return line_number(node("SubRoutineGroup", srgblock.ast()),this.source) },
        SubRoutineGroup_singular(stmtblock) { return line_number(node("SingularSubRoutineGroup", stmtblock.ast()),this.source) },
        Routine(subroutine) { return subroutine.ast() },
        Function(_1, _2, subroutine_group) { return line_number(node("FunctionGroup", subroutine_group.ast()),this.source) },
        Process(_1, _2, subroutine_group) { return line_number(node("ProcessGroup", subroutine_group.ast()),this.source) },
        Server(_1, _2, subroutine_group) { return line_number(node("ServerGroup", subroutine_group.ast()),this.source) },
        SubRoutine(pattern, _1, guard, _2, returnTypes, _3, _4, block) { return line_number(node("SubRoutine", pattern.ast(), guard.ast(), returnTypes.ast(), block.ast()),this.source) },
        Expression(atom_list) {return line_number(node("Expression",atom_list.ast()),this.source)},
        Atom(contents) { return contents.ast() },
        Atom_singleton(_1, exp, _2) { return line_number(node("Expression", exp.ast()),this.source) },
        AbstractType(type, _1, _2, block) { return line_number(node("AbstractType", type.ast(), block.ast()),this.source) },
        DataPattern(pattern, _1, block) { return line_number(node("DataPattern", pattern.ast(), block.ast()),this.source) },
        Select(object, selector) { return line_number(node("Select", object.ast(), selector.ast()),this.source) },
        Selector(list) { return list.ast() },
        Selector_nonSlice(_1, selectOp, _2) { return selectOp.ast() },
        Tuple_nonempty(_1, block, _2) { return line_number(node("Tuple", block.ast()),this.source) },
        Tuple_empty(_1, _2) { return line_number(node("Tuple", []),this.source) },
        List_num(_1, start, _2, step, _3, end, _4) { return line_number(node("NumList", start.ast(), step.ast(), end.ast()),this.source) },
        List_nonempty(_1, seq, _2) { return line_number(node("List", seq.ast()),this.source) },
        List_empty(_1, _2) { return line_number(node("List", []),this.source) },
        index(content) { return content.ast() },
        String(seq) { return line_number(node("String", this.sourceString),this.source) },
        String_interpolated(_1, seq_head, _5, exp, _6, seq_tail, _10) {
            return line_number(node(
                "InterpolatedString", [seq_head, seq_tail].map((x) => x.ast()),
                exp.map((x) => x.ast())
            ),this.source)
        },
        stringbit(_3) { return line_number(node("String", this.sourceString),this.source) },
        numlit(_1, _2, _3, _4, _5, _6) {
            return line_number(node("Numlit", this.sourceString),this.source)
        },
        id(contents) { return line_number(node("Id", this.sourceString),this.source) },
        NonemptyListOf(head, sep, tail) { return [head, tail].map((x) => x.ast()) },
        nospaceops(op) { return line_number(node("Operator", this.sourceString),this.source) },
    }
};
