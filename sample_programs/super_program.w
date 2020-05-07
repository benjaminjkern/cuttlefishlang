[Num] quickSort = fn:
    [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ x ++ quickSort xs[fn: $ >= x]

#! macro line

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

