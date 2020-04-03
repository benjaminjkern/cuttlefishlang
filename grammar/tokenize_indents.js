const fs = require("fs");
const path = require("path");
module.exports = tokenize_indents;

function tokenize_indents(source) {
  let [tokenized, final_space, final_indent] = source.split("\n").reduce(
    (acc, x) => {
      let [text, plen, pind] = acc;
      let clen = get_indentation(x);
      let y = x;
      let cind = pind;
      console.log(y);
      if (clen !== null) {
        if (clen > plen) {
          y = "\n" + "⇨" + "\n" + y;
          cind = cind + 1;
        } else if (clen < plen) {
          y = "\n" + "⇦" + "\n" + y;
          cind = cind - 1;
        } else {
          y = "\n" + y;
        }
      }
      //console.log(`${String(clen + "     ").slice(0,5)} ${y}`)
      return [text + y, clen !== null ? clen : plen, cind];
    },
    ["", 0, 0]
  );
  return tokenized + Array.from(Array(final_indent), x => "⇦");
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

if (!module.parent) {
  console.log(
    tokenize_indents(
      fs.readFileSync(
        path.resolve(__dirname, "../sample_programs/super_program.w"),
        "utf8"
      )
    )
  );
}
