collatz = fn: Int x
    | x %= 2 -> x / 2
    | -> 3 * x + 1

a = 1257510

while a != 1:
    print a
    a = collatz a


print a
