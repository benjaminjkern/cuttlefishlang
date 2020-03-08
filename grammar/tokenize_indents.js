module.exports = tokenize_indents

function tokenize_indents(source){
    let [tokenized,_1] = source.split("\n").reduce((acc,x) => {
        let [text,plen] = acc
        let clen = get_indentation(x)
        let y = x
        if(clen !== null){
            if(clen > plen){
               y = "⇨" + y 
            } else if(clen < plen){
               y = "⇦" + y
            }
        }
        return [text+"\n"+y,(clen !== null)? clen : plen ]
    }  ,["",0])
    return tokenized;
}

let leading_whitespace = /^\s+/
let empty_line = /^(\s*|\n)$/
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
