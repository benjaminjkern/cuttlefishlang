const built_in_types = require("type_tree.js")

module.exports = function infer_types(ast){
    
}

function getType(x){
    if(typeof(x) === "string"){
        return x
    }
    if(x.resolved){
        return x.type
    }
}
function canConsume(element,exp){
    return exp.fields.atoms.some( (x,i,src) => {
        if(getType(src[i]) === element.symbol){
            return Object.entries(element.arity_sig).every( entry=> {
                let [offset,type] = entry
                offset = parseInt(offset)
                return getType(src[i+offset]) === type 
            })
        }
        return false
    })
}

function resolved(funct,args){
    return {
        constructor: funct,
        args : args,
        type : funct.out_type,
        resolved : true
    }
}

function consume(element,exp){
    const focus = exp.findIndex(x => x==element.symbol)
    const argIdx = Object.keys(element.arity_sig).map(x=> focus + parseInt(x))
    const args = exp.filter((el,i)=> argIdx.includes(i))
    return exp.map( (x,i) => {
        if(i === focus){
            return resolved(element,args)
        }
        if(argIdx.includes(i)){
            return undefined
        }
        return x
    }).filter(x => x != undefined)
}

function parseExpression(precedence,exp){
    if(exp.length === 1){
        return exp
    }
    for(const element of precedence){
        if(canConsume(element,exp)){
            console.log(`Consuming ${element.symbol} from ${exp}`)
            const result = parseExpression(precedence,consume(element,exp))
            if(result != null){
                return result
            }
        } else {
            console.log(`Can't consume ${element.symbol} from ${exp}`)
        }
    }
    return null
}
