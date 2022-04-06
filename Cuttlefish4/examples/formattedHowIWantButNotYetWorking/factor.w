
# Factor.w, factors an integer pretty fricken efficiently but not necessarily as efficiently as possible

# displays subcases

# THIS DOES NOT WORK YET BECAUSE MULTIPLE INPUTS DOESNT WORK YET

factor = fn: Int n, Int m = 1
    | n == 1 -> []
    | m * m <= n
        | n %= m -> m ++ factor (n // m) m
        | -> factor n (m + (m == 2 ? 1 : 2))
    | -> [n]

print factor 120510923571235 # uh 

