/* Schema for how the AST is set up. I didnt feel like hard coding class files */

const ASTNodeFields = {
    Program: ["statements"],
    Assignment: ["assignments"],
    SingleAssignment: ["assignee", "value"],
    Reassignment: ["assignee", "op", "value"],
    Print: ["value"],
    If: ["test", "ifTrue", "ifFalse"],
    Catch: ["patterns", "output"],
    For: ["collection", "patterns", "output"],
    While: ["test", "statements"],
    Repeat: ["count", "statements"],
    Return: ["value"],
    Put: ["value"],
    Break: [],
    Continue: [],

    Ternary: ["test", "ifTrue", "ifFalse"],
    BinaryOp: ["left", "op", "right"],
    Application: ["func", "input"],

    List: ["values"],
    Tuple: ["values"],
    Set: ["values"],
    DiscreteRange: ["start", "includeStart", "end", "includeEnd", "step"],
    ContinuousRange: ["start", "includeStart", "end", "includeEnd"],

    Function: ["patterns", "output"],
    Process: ["patterns", "output"],

    Pattern: ["input", "cases", "output"],
    Case: ["test", "cases", "output"],
    PatternElem: ["id", "type", "optional", "multiple", "default"],

    Bool: ["value"],
    Num: ["value"],
    String: ["value"],
    Concat: ["strings"],

    ElementOf: ["parent", "childId"],
    Ref: ["id"],
}

module.exports = ASTNodeFields;