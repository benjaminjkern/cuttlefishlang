const tt = require("./type_tree");
module.exports = (ast) => {
    const { baseNodeTemplate: nodetemplate } = ast.specification_context;
    const builtin_template = Object.create(nodetemplate);
    builtin_template.type = "BuiltIn"
    const builtins = {}
    const type_symmetries = {}

    // this function could perhaps have a better name
    function bib(symbol, typeclass, desc, arity_signature = {}, fields = {}) {
        let builtin = Object.create(builtin_template)
        builtin.symbol = symbol
        builtin.typeclass = typeclass
        if (type_symmetries[typeclass.name]) {
            Object.assign(builtin, type_symmetries[typeclass.name])
        }
        Object.assign(builtin, fields)
        builtins[symbol] = builtin
    }
    Object.entries(tt).map(([symbol, type]) => {
        bib(symbol, tt.Type, {}, { typetree: type })
    })
    bib("$", tt.Glyph, "Supposed to magically turn expression into SubRoutine")
    type_symmetries.InfixOperator = {
        arity_signature: { in: {
                [-1]: tt.Num,
                [1]: tt.Num
            },
            out: tt.Num
        }
    }
    type_symmetries.PrefixOperator = {
        arity_signature: { in: {
                [1]: tt.Num
            },
            out: tt.Num
        }
    }
    type_symmetries.PostfixOperate = {
        arity_signature: {
            [-1]: tt.Num
        }
    }
    bib("<", tt.InfixOperator, "Less than")
    bib("<=", tt.InfixOperator, "Less than or Equal to")
    bib("==", tt.InfixOperator, "Equal to")
    bib(">=", tt.InfixOperator, "Greater than or Equal to")
    bib(">", tt.InfixOperator, "Greater than")
    let [a1, a2, a3] = degreeOfFreedom(3)
    bib("++", tt.InfixOperator, "Concatanate", { in: {
            [-1]: tt.List.AbstractSubType(a1),
            [1]: tt.List.AbstractSubType(a2)
        },
        out: tt.List.AbstractSubType(a3)
    })
    bib("true", tt.Boolean, "True")
    bib("false", tt.Boolean, "False")
    bib("*", tt.InfixOperator, "Multiplication")
    bib("/", tt.InfixOperator, "Division")
    bib("%", tt.InfixOperator, "Modulo Division")
    bib("+", tt.InfixOperator, "Addition")
    bib("-", tt.InfixOperator, "Subtraction")
    bib("self", tt.Glyph, "Self-Reference")
    return builtins
}