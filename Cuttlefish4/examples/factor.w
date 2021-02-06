
# Factor.w, factors an integer pretty fricken efficiently but not necessarily as efficiently as possible

# displays subcases

factor = fn: Int n, Int m
    | n == 1 -> []
    | m * m <= n
        | n %= m -> m ++ factor (n // m) m
        | -> factor n (m + (m == 2 ? 1 : 2))
    | -> [n]

print factor 120510923571235 # uh 

