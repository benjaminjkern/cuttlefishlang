const fs = require("fs");
const path = require("path");
module.exports = tokenize_indents;

<<<<<<< HEAD
function tokenize_indents(source){
    let [tokenized,final_space,final_indent] = source.split("\n").reduce((acc,x) => {
        let [text,plen,pind] = acc
        let clen = get_indentation(x)
        let y = x
        let cind = pind
        console.log(y) 
        if(clen !== null){
            if(clen > plen){
                y = "\n"+"⇨" + y
                cind = cind + 1
            } else if(clen < plen){
                y ="\n"+ y + "⇦" 
                cind = cind - 1
            } else {
                y = "\n" + y
            }
        }
        //console.log(`${String(clen + "     ").slice(0,5)} ${y}`)
        return [text+y,(clen !== null)? clen : plen,cind]
    }  ,["",0,0])
    return tokenized+Array.from(Array(final_indent), x => "⇦" );
=======
function tokenize_indents(source) {
    let [tokenized, final_space, final_indent] = source.split("\n").reduce(
        (acc, x) => {
            let [text, plen, pind] = acc;
            let clen = get_indentation(x);
            let y = x;
            let cind = pind;
            if (clen !== null) {
                if (clen > plen) {
                    y = "\n" + "⇨" + y;
                    cind = cind + 1;
                } else if (clen < plen) {
                    y = "⇦" + "\n" + y;
                    cind = cind - 1;
                } else {
                    y = "\n" + y;
                }
            }
            return [text + y, clen !== null ? clen : plen, cind];
        }, ["", 0, 0]
    );
    return tokenized + Array.from(Array(final_indent), x => "⇦");
>>>>>>> 624d1ebd0105709fc3ce58318a9a5d6c2f52d49b
}

let leading_whitespace = /^\s+/;
let empty_line = /^(\s*|\n)$/;

function get_indentation(line) {
    if (empty_line.test(line)) {
        return null;
    }
    let l = line.match(leading_whitespace);
    if (l === null) {
        return 0;
    }
    return l[0].length;
}

<<<<<<< HEAD
if(!module.parent){
    console.log(tokenize_indents(fs.readFileSync(path.resolve(__dirname,"../sample_programs/super_program.w"),'utf8')))
}
=======
if (!module.parent) {
    console.log(
        tokenize_indents(
            fs.readFileSync(
                path.resolve(__dirname, "../sample_programs/trivial_test.w"),
                "utf8"
            )
        )
    );
}
>>>>>>> 624d1ebd0105709fc3ce58318a9a5d6c2f52d49b
