[Num] quickSort = fn:
    [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ x ++ quickSort xs[fn: $ >= x]

#! macro line


dumb = fn:
    (a b c d, e f g h, i j k l), [m] n:o ->
        d h l
        n ++ o
    p -> fn: q -> fn: r -> #/ hello /# p q r


dumber = fn:
    a -> fn:
        b -> fn:
            c -> d

dumberer = fn:
    a,b ->
        fn:             c -> c; e ->e
# comments within indentations, not sure if they fuck it up
    g | h i j -> g
            # more comments
    l, m, n | false -> l 5555555.99999999 fn: $ * $
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


# same thing as above but with a process that iteratively returns next instead of a function that returns an infinite list

Int fibGen = prc:
    () -> self (1, 1)
    (Int a, Int b) -> put a, self (b, a + b)

my_proc = prc: x ->
    x = x + 1
    put x
    self x

my_server = srv:
    () ->
        my_proc 0
        my_proc 0
        my_proc 0
    1 -> "Hello"
    2 -> "World"
    x -> '{x} Potato'

primeFilter = fn: x:tail -> x ++ primeFilter tail[fn: $ % x != 0]

[Object] filter = fn:
    [], Object => Bool fun -> []
    [Object] head:tail, Object => Bool fun | fun head -> head ++ filter fun tail
    [Object] head:tail, Object => Bool fun -> filter tail fun

