/* Schema for how the AST is set up. I didnt feel like hard coding class files */

const ASTNodeFields = {
    Program: ["statements"],
    PatternBlock: ["patterns"],

    Assignment: ["assignments"],
    SingleAssignment: ["assignee", "value", "constant"],
    Reassignment: ["assignee", "op", "value"],
    Print: ["value"],
    If: ["test", "ifTrue", "ifFalse"],
    Switch: ["object", "patterns"],
    Catch: ["patterns"],
    For: ["collection", "patterns"],
    While: ["test", "statements"],
    Repeat: ["count", "statements"],
    Return: ["value"],
    Put: ["value"],
    Break: [],
    Continue: [],

    UnparsedExp: ["atoms"],

    List: ["values"],
    Tuple: ["values"],
    Set: ["values"],
    DiscreteRange: ["start", "includeStart", "end", "includeEnd", "step"],
    ContinuousRange: ["start", "includeStart", "end", "includeEnd"],

    Function: ["patterns"],
    Process: ["patterns"],

    Pattern: ["input", "tests", "output"],
    PatternElem: ["id", "type", "optional", "multiple", "default"],

    Bool: ["value"],
    Num: ["value"],
    String: ["value"],
    Concat: ["strings"],

    ElementOf: ["parent", "childId"],
}

module.exports = ASTNodeFields;