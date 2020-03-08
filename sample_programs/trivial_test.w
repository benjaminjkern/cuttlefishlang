factorial = fn:
    0 -> 1
    Int x | x > 0 -> x * factorial (x - 1)
