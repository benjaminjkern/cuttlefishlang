sevenBoom = fn:
    [] -> "there is no 7 in the array"
    [Int] numList
        | containsSeven numList[0] -> "Boom!"
        | -> sevenBoom numList[1..]

# sevenBoom = fn: [] -> []; [Int] numList | containsSeven numList[0] -> "Boom!"; | -> sevenBoom numList[1..]

containsSeven = fn:
    0 -> false
    Int n
        | n % 10 == 7 -> true
        | -> containsSeven (n // 10)

# containsSeven = fn: 0 -> false; Int n | n % 10 == 7 -> true; | -> containsSeven (n // 10)


# But theres no way of knowing where to put the last line in this

repeat 9: print "hello"
for [1..9]: print "hello"
###
i = 1; while i <= 9: print "hello"; i += 1 # By default, this will loop infinitely
i = 1; while i <= 9: { print "hello"; i += 1 }

if 4 < 5: print "hello"; print "what"; else repeat while 4 < 5: for [1..2): i -> print "what"

factor = fn: Int n, Int m
    | n == 1 -> []
    | m * m <= n
        | n %= m -> m ++ factor (n // m) m
        | -> factor n (m + (m == 2 ? 1 : 2))
    | -> [n]

factor = fn: Int n, Int m | n == 1 -> []; | { m * m <= n | n %= m -> m ++ factor (n // m) m; | -> factor n (m + (m == 2 ? 1 : 2)) };  | -> [n]
