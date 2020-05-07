class Type {
    
    constructor(name,parents){
        this.name = name
        this.parents = parents
        this.subtypes = []
    }

    append(name){
        const newType = new Type(name,[this])
        this.subtypes.push(newType)
        return newType
    }

    
}
const type_tree = {}
function newType(name,parents){
    type_tree[name] = new Type(name,parents)
}
function appendType(name,appendTo){
    if(typeof(appendTo) === "object"){
        type_tree[name] = new Type(name,appendTo)
        for(const parent of appendTo){
            type_tree[parent].subtypes.push(type_tree[name])
        }
    } else {
        type_tree[name] = type_tree[appendTo].append(name)
    }
}
//Notes to self: SubTypes of Tuple are subtypes of the intersection of their constituent types
newType("Entity",[])
appendType("Tuple","Entity")
appendType("Equatable","Entity")
appendType("Comparable","Equatable")
//Types
appendType("Type","Equatable")
//Booleans
appendType("Boolean","Equatable")
//SubRoutines
appendType("SubRoutineGroup","Entity")
appendType("SubRoutine", "Entity")
appendType("Server", "SubRoutine")
appendType("Proccess", "SubRountine")
appendType("Function", "SubRountine")
//Sequences
appendType("Sequence","Entity")//Not neccessarily finite
appendType("List","Sequence")//Finite Sequence
appendType("String","List")//Finite Sequence of characters
//Number Stuff
appendType("Number","Comparable")
appendType("Real","Number")
appendType("Ordinal","Comparable")//Countably infinite
appendType("Rational",["Real","Ordinal"])
appendType("Integer",["Rational","Ordinal","Boolean"]) //Hack to make 0 False and non-zero True
module.exports = type_tree
