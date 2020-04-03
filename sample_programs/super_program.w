
main =:
    limit = Number $[0]

    x = 1

    for [0..limit]:
        print '2^{$} = {x}'
        x += x



quickSort :=
    [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ [x] ++ quickSort xs[fn: $ >= x]


print quickSort [2,4,5,3,6,1] # [1,2,3,4,5,6]

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
 


primeFilter := x:tail -> x ++ primeFilter tail[fn: $ % x != 0]

