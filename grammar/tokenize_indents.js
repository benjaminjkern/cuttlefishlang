const fs = require('fs')
const path = require('path')
module.exports = tokenize_indents

function tokenize_indents(source){
    let [tokenized,final_indents] = source.split("\n").reduce((acc,x) => {
        let [text,plens] = acc
        let clen = get_indentation(x)
        let y = x
        if(clen !== null){
            if(clen > plens.peek()){
                y = "\n"+"⇨"+"\n" + y
                plens.push(clen)
            } else if(clen < plens.peek()){
                while(clen < plens.peek()){
                    y ="\n"+ "⇦" + "\n"+ y
                    plens.pop()
                }
            } else {
                y = "\n" + y
            }
        }
        return [text+y,plens]
    }  ,["",stack([0])])
    final_indents.pop() // Get rid of initial 0
    final_indents.map(x => tokenized += "\n⇦\n" )
    return tokenized;
}

function stack(x){
    x.peek = function () { return this.slice(-1).pop()}
    return x
}


let leading_whitespace = /^\s+/
let empty_line = /^(\s*|\s*\n)$/
function get_indentation(line){
    if (empty_line.test(line)){
        return null
    }
    let l = line.match(leading_whitespace)
    if(l === null){
        return 0
    }
    return l[0].length
}

if(!module.parent){
    const tokenizer = require(path.resolve(__dirname,'tokenize_indents.js'))
    const ohm = require("ohm-js");
    const basegrammar = ohm.grammar(
        fs.readFileSync(path.resolve(__dirname, "cuttlefish.ohm"))
    );
    const tokenized = tokenize_indents(
        fs.readFileSync(path.resolve(__dirname,"../sample_programs/super_program.w"),'utf8')
    )
    console.log(tokenized)
    const match = basegrammar.match(tokenized)
    if (match.failed()){
        console.log(match.message)
    } else {
        console.log("all dandy")
    }


}
