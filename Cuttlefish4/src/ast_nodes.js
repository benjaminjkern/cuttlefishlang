/* Schema for how the AST is set up. I didnt feel like hard coding class files */

const ASTNodeFields = {
    Program: ["statements"],
    Assignment: ["assignments"],
    SingleAssignment: ["assignee", "value"],
    Reassignment: ["assignee", "op", "value"],
    Print: ["value"],
    If: ["test", "ifTrue", "ifFalse"],
    Catch: ["patterns"],
    While: ["test", "statements"],
    Repeat: ["statements"],
    For: ["collection", "patterns"],
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
    Map: ["patterns"],
    DiscreteRange: ["start", "includeStart", "end", "includeEnd", "step"],
    ContinuousRange: ["start", "includeStart", "end", "includeEnd"],
    Function: ["patterns", "output"],
    Process: ["patterns", "output"],
    Type: ["id"],

    Pattern: ["input", "cases", "output"],
    Case: ["test", "cases", "output"],
    PatternElem: ["id", "type", "optional", "multiple", "default"],
    ListType: ["type"],

    Bool: ["value"],
    Num: ["value"],
    String: ["value"],
    ExpressionString: ["strings", "expressions"],

    ElementOf: ["parent", "childId"],
    Ref: ["id"],
}

module.exports = ASTNodeFields;