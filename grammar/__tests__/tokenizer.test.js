const path = require('path')
const fs = require('fs')
const tokenizer = require(path.resolve(__dirname,'../tokenize_indents.js'))
const ohm = require("ohm-js");
const basegrammar = ohm.grammar(
    fs.readFileSync(path.resolve(__dirname, "../cuttlefish.ohm"))
);

const containsArrow = /[⇦⇨]/
function stripDentLines(text){
    return text.split("\n").filter(x => !containsArrow.test(x)).join("\n")
}
function stripWhitespace(string){
    return string.replace(/\s/g,'')
}

const basicIndents = `
a
⇨
    b
⇨
        c
        d
⇦
    e
⇨
        f
        g
⇦
    h
⇦
i
`.trim()
test('basic indentation', ()=>{
    expect(stripWhitespace(tokenizer(stripDentLines(basicIndents)))).toBe(stripWhitespace(basicIndents));
})

const variedIndents = `
a
⇨
  b
⇨
        c
        d
⇦
  e
⇨
      f
      g
⇦
  h
⇦
i
`
test('varied indentation', ()=>{
    expect(stripWhitespace(tokenizer(stripDentLines(variedIndents)))).toBe(stripWhitespace(variedIndents));
})

const multipleDedents = `
a
⇨
  b
⇨
        c
        d
⇦
  e
⇨
      f
      g
⇦
⇦
i
`
test('multiple dedentation', ()=>{
    expect(stripWhitespace(tokenizer(stripDentLines(multipleDedents)))).toBe(stripWhitespace(multipleDedents));
})

const trailingDedents = `
a
⇨
  b
⇨
        c
        d
⇦
  e
⇨
      f
      g
⇦
⇦
`
test('trailing dedentation', ()=>{
    expect(stripWhitespace(tokenizer(stripDentLines(trailingDedents)))).toBe(stripWhitespace(trailingDedents));
})
