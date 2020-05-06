
const plus = {
    symbol : ("+"),
    arity_sig : {[-1]:"Num",[1]:"Num"},
    out_type : ("Num")
}

const times = {
    symbol : ("*"),
    arity_sig : {[-1]:"Num",[1]:"Num"},
    out_type : ("Num")
}


const exponent = {
    symbol : ("*"),
    arity_sig : {[-1]:"Num",[1]:"Num"},
    out_type : ("Num")
}

const f = {
    symbol : ("f"),
    arity_sig : {[1]:"Num"},
    out_type : ("Num")
}

const g = {
    symbol : ("g"),
    arity_sig : {[1]:"Num"},
    out_type : ("Num")
}

const h = {
    symbol : ("h"),
    arity_sig : {[1]:"Num",[2]:"Num"},
    out_type : ("Num")
}
const test_expression = ["h","Num","Num","+","f","Num","*","Num"]
const test_precedence = [exponent,times,plus,f,g,h]

function getType(x){
    if(typeof(x) === "string"){
        return x
    }
    if(x.resolved){
        return x.type
    }
}


function canConsume(element,exp){
    return exp.some( (x,i,src) => {
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


console.log(canConsume(h,test_expression))
console.log(consume(h,test_expression))
console.log(parseExpression(test_precedence,test_expression))


//Shameless rip of Fisher-Yates from user Blender on SO
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

console.log(parseExpression(shuffle(test_precedence),test_expression))

