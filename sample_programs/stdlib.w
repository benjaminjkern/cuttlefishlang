[Object] map = fn:
    [], Object => Object fun
        -> []
    [Object] head:tail, fun
        -> fun head ++ map tail fun

[Object] filter = fn:
    [], Object => Bool fun -> []
    [Object] head:tail, Object => Bool fun | fun head -> head ++ filter fun tail
    [Object] head:tail, Object => Bool fun -> filter tail fun

Num sum = fn:
    [Num] a:rest, Num => Num fun -> fun a + sum rest fun
    [], Num => Num fun -> 0
    [Num] list -> sum list fn: $

Num product = fn:
    [Num] a:rest, Num => Num fun -> fun a * product rest fun
    [], Num => Num fun -> 1
    [Num] list -> product list fn: $

Num dotProduct = fn:
    [], [] -> 0
    [Num] a:restA, [Num] b:restB -> a * b + dotProduct restA restB

[Num] crossProduct = fn:
    [Num] a, [Num] b | len a == len b == 3 -> [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]

Bool any = fn:
    [Bool] true:rest -> true
    [Bool] false:rest -> any rest
    [] -> false
    [Object] a:rest, Object => Bool fun
        | fun a -> true
        -> any rest fun
    [], Object => Bool fun -> false

Bool all = fn:
    [Bool] false:rest -> false
    [Bool] true:rest -> any rest
    [] -> true
    [Object] a:rest, Object => Bool fun
        | fun a -> any rest fun
        -> false
    [], Object => Bool fun -> true

