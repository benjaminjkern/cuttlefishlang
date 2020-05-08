const tt = require("./type_tree")

module.exports = (ast) => {
        const context = ast.specification_context

        function arity_signature(name, mapping) {
            if (context.nodeConstructors[name].type_inf === undefined) {
                context.nodeConstructors[name].template.type_inf = {}
            }
            context.nodeConstructors[name].template.type_inf.arity_signature = mapping
        }

        function outputType(name, mapping) {
            if (context.nodeConstructors[name].type_inf === undefined) {
                context.nodeConstructors[name].template.type_inf = {}
            }
            context.nodeConstructors[name].template.type_inf.out = mapping
        }
        tt.List.AbstractSubType = function(n) {

        }

        function degreeOfFreedom(n) {
            const set = [...Array(n).keys()].map(x => { group: [] })
            set.map((x, i) => {
                [...Array(n)].map(y => {
                    if (i !== n) {
                        x.group.push(set[n])
                    }
                })
            })
            return set
        }

        arity_signature("Guard", { "exp": tt.Boolean })
        arity_signature("Select", [{ in: { "subject": tt.List.AbstractSubType(1), "predicate": tt.Ordinal },
                        out: tt.AbstractType(11)
                    }
                }