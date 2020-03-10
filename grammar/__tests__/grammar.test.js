/*
 * Grammar Success Test
 *
 * These tests check that our grammar accepts a program that features all of
 * syntactic forms of the language.
 */

const syntaxCheck = require("../syntax-checker");

const program = String.raw `
main = prc:
⇨   limit = Number $[0]

    x = 1

    for [0..limit]:
    ⇨   print \`2^{$} = {x}\`
        x += x
⇦
⇦

quickSort :=
⇨   [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ [x] ++ quickSort xs[fn: $ >= x]
⇦

print quickSort [2,4,5,3,6,1] # [1,2,3,4,5,6]

proc = prc: x ->
⇨   x = x + 1
    put x
    self x
⇦

my_server = srv:
⇨   () ->
⇨       self ++ proc 0
        self ++ proc 0
        self ++ proc 0
    ⇦
    1 -> put "Hello"
    2 -> put "World"
    x -> put \`{x} Potato\`
⇦

s = my_server()

print s() # 'Hello'
print s() # 'Hello' or 'World'
print s() # 'Hello' or 'World' or '3 Potato'
print s() # 'Hello' or 'World' or '3 Potato' or '4 Potato'

primeFilter = fn: x:tail -> x ++ primeFilter tail[fn: $ % x != 0]

print primeFilter [2..]

`;

describe("The syntax checker", () => {
    test("accepts the mega program with all syntactic forms", done => {
        expect(syntaxCheck(program)).toBe(true);
        done();
    });
});