const gen_builtins = require("./builtins")
module.exports = function resolve_context(ast){
    
    const builtins = gen_builtins(ast)
    const global_bound = Object.create(builtins)
    const bound_rules = {
        set: function(obj,id,value,reciever){
            if(Object.prototype.hasOwnProperty.call(obj,id)){
                console.log(obj)
                throw `id: ${id} at line ${value.line_number} has aleady been bound in this scope`
            }
            Object.defineProperty(reciever,id,{value:value});
            return true
        }

    }


    const global_proxy = new Proxy(global_bound,bound_rules)


    const identified_resolution = { bound:global_proxy,referenced:{},children:[]}
    identified_resolution.level = 0


    ast.traverse(ast,resolver,identified_resolution,["Pattern"])
    decorator(identified_resolution)
}

function decorator(binding_context){
    Object.entries(binding_context.referenced).map(([id,instances])=>{
        let bound_entity = binding_context.bound[id]
        if(!bound_entity){
            throw `Error on line ${instances[0].line_number} : id: ${id} not bound in current scope`
        }
        instances.map(node => {node.representing = bound_entity})
    })
    binding_context.children.map(x=>decorator(x))
}

const scope_transitions = ["SubRoutine","AssignmentStatement"] //Fishy hack to deal with statements in a block re-binding stuff.

function resolver(node,binding_context,type){
    console.log(`level:${binding_context.level}`)
    //Happens before scope change, because you expect access to the name
    //of a function in that function, in order to recurse.
    let parent_context = undefined
    if(scope_transitions.includes(type)){
        console.log(`Lowered Scope: ${type} Line: ${node.line_number}`)
        let new_context = {
            bound:Object.create(binding_context.bound),
            referenced: {},
            children: [],
            parent: binding_context,
            level: binding_context.level + 1
        }
        binding_context.children.push(new_context)
        parent_context = binding_context
        binding_context = new_context //If the linter doesn't like it, it's wrong
    }

    if(type == "AssignmentStatement"){
        bind_pattern_expression(node.fields.id,node.fields.exp,binding_context,parent_context)
    }

    if(type == "SubRoutine"){
        bind_subroutine_input(node,node.fields.pattern,binding_context)
    }
    if(type == "Id"){
        if(binding_context.referenced[node.fields.id] === undefined){
            binding_context.referenced[node.fields.id] = []
        }
        binding_context.referenced[node.fields.id].push(node)
    }
    return binding_context
}

function bind_pattern_expression(pattern,expression,binding_context,parent_context){
    //What does x,y = blah MEAN? Is it x = y = blah? Is it the same as a tupe assignment?
    if(pattern.fields.patternElems.length !== 1){
        throw "x,y=Expresssion Grammar Ambiguity. Easily fixed, we just need to decide on something";
    }
    expression.matches = pattern
    pattern.matches = expression
    pattern.form = "Output"
    if(parent_context){
        if(expression.fields.atoms.length == 1 && expression.fields.atoms[0].query(expression.fields.atoms[0],selectType("SubRoutine"),undefined,["Expression"]).length>0){
            [parent_context,binding_context] = [binding_context,parent_context]
        }
    }

    for(const elem of pattern.fields.patternElems){
        elem.query(elem,selectType("Id"),undefined,["Type"]).map(id=> {
            binding_context.bound[id.fields.id] = pattern
        })
        elem.query(elem,selectType("Type"),undefined,[]).map(type => {
            if(type.fields.id.type == "Id"){
                default_push(parent_context.referenced,type.fields.id.fields.id,type)
            }
        })
    }
}
function bind_subroutine_input(subroutine,pattern,binding_context){
    subroutine.arity = pattern.fields.patternElems.length
    pattern.form = "Input"
    for(const elem of pattern.fields.patternElems){
        elem.query(elem,selectType("Id"),undefined,["Type","ListPattern"]).map(id=> { 
            console.log(`binding ${id.fields.id} on line ${pattern.line_number}`)
            binding_context.bound[id.fields.id] = pattern
        })
        elem.query(elem,selectType("ListPattern"),undefined,[]).map(lp => {
            binding_context.bound[lp.fields.head.fields.id] = pattern
            binding_context.bound[lp.fields.tail.fields.id] = pattern
        })
        elem.query(elem,selectType("Type"),undefined,[]).map(type => {
            if(type.fields.id.type == "Id"){
                default_push(binding_context.referenced,type.fields.id.fields.id,type)
            }
        })
    }
}

function selectType(target_type,skip=false){
    if(skip){ 
        return function get_node_skip(node,acc,type){
            if(type == target_type){
                if(acc--){
                    return {res:undefined,acc:acc}
                }
                return {res: node.fields.id, acc:acc}
            }
            return {res: undefined,acc:acc}
        }

    }
    return function get_node(node,acc,type){
        if(type == target_type){
            return node
        }
        return undefined
    }
}
function default_push(object,fieldname,value){
    if(!object[fieldname]){
        object[fieldname] = []
    }
    object[fieldname].push(value)
}

