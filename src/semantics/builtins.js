const tt = require("./type_tree");
module.exports = (ast) => {
    const {baseNodeTemplate:nodetemplate} = ast.specification_context;
    const builtin_template = Object.create(nodetemplate);
    builtin_template.type = "BuiltIn" 
    function arity_signature(name,mapping){
        ast.specification_context.nodeConstructors[name].template.type_inf = mapping
    }
    function degreeOfFreedom(n){
        const set = [...Array(n).keys()].map(x => {DOF:true;group:[]})
        set.map((x,i) => {
            [...Array(n)].map(y => {
                if(i !== n){
                    x.group.push(set[n])
                }
            })
        })
        return set
    }
    const builtins = {}
    const type_symmetries = {}
    function bib(symbol,typeclass,desc,arity_signature={},fields={}){
        let builtin = Object.create(builtin_template)
        builtin.symbol = symbol
        builtin.typeclass = typeclass
        if(type_symmetries[typeclass.name]){
            Object.assign(builtin,type_symmetries[typeclass.name])
        }
        Object.assign(builtin,fields)
        builtins[symbol] = builtin
    }
    Object.entries(tt).map(([symbol,type]) =>{
        bib(symbol,tt.Type,{},{typetree:type})
    })
    bib("$",tt.Glyph,"Supposed to magically turn expression into SubRoutine")
    type_symmetries.InfixOperator={arity_signature:{in:{[-1]:tt.Num,[1]:tt.Num},out:tt.Num}}
    type_symmetries.PrefixOperator = {arity_signature:{in:{[1]:tt.Num},out:tt.Num}}
    type_symmetries.PostfixOperate = {arity_signature:{[-1]:tt.Num}}
    bib("<",tt.InfixOperator,"Less than")
    bib("<=",tt.InfixOperator,"Less than or Equal to")
    bib("==",tt.InfixOperator,"Equal to")
    bib(">=",tt.InfixOperator,"Greater than or Equal to")
    bib(">",tt.InfixOperator,"Greater than")
    let [d1,d2,d3] = degreeOfFreedom(3)
    bib("++",tt.InfixOperator,"Concatanate",{in:{[-1]:tt.List.AbstractSubType(d1),[1]:tt.List.AbstractSubType(d2)},out:tt.List.AbstractSubType(d3) })
    bib("true",tt.Boolean,"True")
    bib("false",tt.Boolean,"False")
    bib("*",tt.InfixOperator,"Multiplication")
    bib("/",tt.InfixOperator,"Division")
    bib("%",tt.InfixOperator,"Modulo Division")
    bib("+",tt.InfixOperator,"Addition")
    bib("-",tt.InfixOperator,"Subtraction")
    bib("self",tt.Glyph,"Self-Reference")
    

    function AbstractType(dof){
        return {dof}
    }
    tt.List.ConcreteSubType = function(type){
        let name=  "List<" + type.name + ">"
        tt.f.appendType(name,tt.List.name)
        return tt[name]
    }
    tt.List.AbstractSubType = function(dof){
        const at = Object.create(tt.List)
        at.dof = dof
        dof.linked = at
        at.parents = [tt.List]
    }
    tt.SubRoutine.SubType = function(im,out){ 
        const at = Object.create(tt.SubRoutine)
        if(im.DOF){
            at.dof = im
            im.linked = at
        }
        if(out.DOF){
            at.dof = out
            out.linked = at
        }
        if(!im.DOF && !out.DOF){
            tt.f.appendType("SubRoutine<"+im.name+"><"+out.name+">","SubRoutine")
        }
        at.parents = [tt.SubRoutine]
    }
    let [a1,a2] = degreeOfFreedom(2)
    let [b1,b2] = degreeOfFreedom(2)
    let [c1,c2,c3] = degreeOfFreedom(3)
    arity_signature("Guard",{in:{"exp":tt.Boolean}})
    arity_signature("Select",[
        {in:{"subject":tt.List.AbstractSubType(a1),"predicate":tt.Ordinal},out:tt.AbstractType(a2)  },
        {in:{subject:tt.List.AbstractSubType(b1),predicate:tt.List.ConcreteSubType(tt.Ordinal)},out:tt.List.AbstractSubType(b2)},
        {in:{"subject":tt.List.AbstractSubType(c1),"predicate":tt.SubRoutine.SubType(c3,tt.Boolean)},out:tt.List.AbstractSubType(c2)}])
    
    
    return builtins
}
