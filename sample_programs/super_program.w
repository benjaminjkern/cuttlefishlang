[Num] quickSort = fn:
    [] -> []
    [Num] x:xs -> quickSort(xs[< x]) ++ x ++ quickSort(xs[>= x])

#! macro line

print quickSort [2,4,5,3,6,1] # [1,2,3,4,5,6]

dumb = fn:
    (a b c d, e f g h, i j k l), [m] n:o ->
        d h l
        n ++ o
    p -> fn: q -> fn: r -> #/ hello /# p q r


dumber = fn:
    a -> fn:
        b -> fn:
            c -> d

dumber = fn:
    a,b ->
        fn:             c -> d; e ->f
# comments within indentations, not sure if they fuck it up
    g | h i j -> k
            # more comments
    l, m, n | false -> o 5555555.99999999 fn: $ * $
        #     ^ this should not work when we do optimization because the guard of "false" should never run


#/ this is a


  yeet




multiline comment/#

Int factorial = fn:
               0 -> 1
               Int x | x > 0 -> x * factorial (x - 1)

[Int] fibs = fn:
    () -> fibs (1,1)
    (Int a, Int b) -> a ++ fibs (b, a + b)

fibs() # [1, 1, 2, 3, 5, 8, 13, 21, 34, 55...]

# same thing as above but with a process that iteratively returns next instead of a function that returns an infinite list

Int fibGen = prc:
    () -> self (1, 1)
    (Int a, Int b) -> put a, self (b, a + b)

f = fibGen()
print f() # 1
print f() # 1
print f() # 2
print f() # 3

proc = prc: x ->
    x = x + 1
    put x
    self x

my_server = srv:
    () ->
        self ++ proc 0
        self ++ proc 0
        self ++ proc 0
    1 -> put "Hello"
    2 -> put "World"
    x -> put '{x} Potato'

primeFilter = fn: x:tail -> x ++ primeFilter tail[fn: $ % x != 0]

[Object] filter = fn:
    [], Object => Bool fun -> []
    [Object] head:tail, Object => Bool fun | fun head -> head ++ filter fun tail
    [Object] head:tail, Object => Bool fun -> filter tail fun

