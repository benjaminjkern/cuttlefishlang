reduce [2, 3, 4] (fn: p,c -> p + c) 0

filter [2,3,4] fn: x -> x %= 2

map [2,3,4] fn: x -> 2 * x

(fn: [] -> 0; x:xs -> x + self xs) [2, 3, 4]



# Here is the mandelbrot set (implemented with functional ranges)

mandelbrot = fn:
    Complex z -> mandelbrot 0 z
    Complex z, Complex c
        | |z| > 2 -> false
        | catch next (RecursionException or StackOverflowException) -> true
        | -> mandelbrot (z^2 + c) c

# essentially all this does is just let you write x in the range lol
mandelbrotSet = Range mandelbrot

###
0 in mandelbrotSet
-> mandelbrot 0
-> mandelbrot 0 0
-> mandelbrot 0 0 -> RecursionException
-> true

1 in mandelbrotSet
-> mandelbrot 1
-> mandelbrot 0 1
-> mandelbrot 2 1
-> mandelbrot 5 1
-> false

0.1 in mandelbrotSet
-> mandelbrot 0.1
-> mandelbrot 0 0.1
-> mandelbrot 0.11 0.1
-> mandelbrot 0.1121 0.1
-> mandelbrot 
###








Normally functions just look like this

f = fn: x -> x + 2

print f 2 # 4

print print.signature # 'print' {String}

print f.signature # 'f' {Number}

f ++=: x, y -> x + y

this is shorthand for
f = f ++ fn: x, y -> x + y

print f.signature # 'f' {Number} | 'f' {Number} {Number}

`{Number a} is cool` = f a

f = fn:
    Number x, Number y -> x + y

print f.signature # 'f' Number | 'f' Number Number | Number 'is' 'cool'

print f.returns # Number

print 5 is cool # 7

print String.patterns # Number | stringraw

print Number.patterns # 'f' Number | 'f' Number Number | Number 'is' 'cool' | numlit

There are 4 different possible parses given these rules:

f (8 is cool) (f 9 (f (8 is cool)))
f (8 is cool) (f 9 ((f 8) is cool)))
f (8 is cool) ((f 9 (f 8)) is cool)
(f (8 is cool) (f 9 (f 8))) is cool

AND 74 different parses if you add in the Number -> Number Number for multiplication rule. I don't know exactly what they are I just used a counter for it. I am currently working on a separate parser

Num -> f 8 is cool f 9 f 8 is cool -> PASS(f(8 is cool(f(9(f(8 is cool))))))
  'f' Number -> f 8 is cool f 9 f 8 is cool -> FAIL
    'f' Number -> 8 is cool f 9 f 8 is cool -> FAIL
    'f' Number Number -> 8 is cool f 9 f 8 is cool -> FAIL
    Number 'is' 'cool' -> 8 is cool f 9 f 8 is cool -> FAIL
      'f' Number 'is' 'cool' -> 8 is cool f 9 f 8 is cool -> FAIL
      'f' Number Number 'is' 'cool' -> 8 is cool f 9 f 8 is cool -> FAIL
      Number 'is' 'cool' 'is' 'cool' -> 8 is cool f 9 f 8 is cool -> FAIL
      numlit 'is' 'cool' -> 8 is cool f 9 f 8 is cool -> FAIL
    numlit -> 8 is cool f 9 f 8 is cool -> FAIL
  'f' Number Number -> f 8 is cool f 9 f 8 is cool -> PASS(f(8 is cool(f(9(f(8 is cool))))))
    'f' Number Number -> 8 is cool f 9 f 8 is cool -> FAIL
    'f' Number Number Number -> 8 is cool f 9 f 8 is cool -> FAIL
    Number 'is' 'cool' Number -> 8 is cool f 9 f 8 is cool -> PASS(8 is cool(f(9(f(8 is cool)))))
      'f' Number 'is' 'cool' Number -> 8 is cool f 9 f 8 is cool -> FAIL
      'f' Number Number 'is' 'cool' Number -> 8 is cool f 9 f 8 is cool -> FAIL
      Number 'is' 'cool' 'is' 'cool' Number -> 8 is cool f 9 f 8 is cool -> FAIL
      numlit 'is' cool' Number -> 8 is cool f 9 f 8 is cool -> PASS(8 is cool(f(9(f(8 is cool)))))
        'f' Number -> f 9 f 8 is cool -> FAIL
          'f' Number -> 9 f 8 is cool -> FAIL
          'f' Number Number -> 9 f 8 is cool -> FAIL
          Number 'is' 'cool' -> 9 f 8 is cool -> FAIL
            'f' Number 'is' 'cool' -> 9 f 8 is cool -> FAIL
            'f' Number Number 'is' 'cool' -> 9 f 8 is cool -> FAIL
            Number 'is' 'cool' 'is' 'cool' -> 9 f 8 is cool -> FAIL
            numlit 'is' 'cool' -> 9 f 8 is cool -> FAIL
          numlit -> 9 f 8 is cool -> FAIL
        'f' Number Number -> f 9 f 8 is cool -> PASS(f(9(f(8 is cool))))
          'f' Number Number -> 9 f 8 is cool -> FAIL
          'f' Number Number Number -> 9 f 8 is cool -> FAIL
          Number 'is' 'cool' Number -> 9 f 8 is cool -> FAIL
            'f' Number 'is' 'cool' Number -> 9 f 8 is cool -> FAIL
            'f' Number Number 'is' 'cool' Number -> 9 f 8 is cool -> FAIL
            Number 'is' cool' 'is' 'cool' Number -> 9 f 8 is cool -> FAIL
            numlit 'is' 'cool' Number -> FAIL
          numlit Number -> 9 f 8 is cool -> PASS(9(f(8 is cool)))
            'f' Number -> f 8 is cool -> PASS(f(8 is cool))
              'f' Number -> 8 is cool -> FAIL
              'f' Number Number -> 8 is cool -> FAIL
              Number 'is' 'cool' -> 8 is cool -> PASS(8 is cool)
                'f' Number 'is' 'cool' -> 8 is cool -> FAIL
                'f' Number Number 'is' 'cool' -> 8 is cool -> FAIL
                Number 'is' 'cool' 'is' 'cool' -> 8 is cool -> FAIL
                numlit 'is' 'cool' -> 8 is cool -> PASS(8 is cool)



x = 0

while x < 10:
    x += 1





if x: print y else: print y



ugh









if = fn:
    condition, !':', ifTrue, !'else', ifFalse
        | condition() -> ifTrue()
        | -> ifFalse()
    condition, !':', ifTrue
        | condition() -> ifTrue()
        | -> return

typeof if
(nil=>Bool)=>(Raw ':')=>(nil=>A)=>(Raw 'else')=>(nil=>A)=>A | (nil=>Bool)=>(Raw ':')=>(nil=>A)=>A


typeof x = 5
(nil=>Int)