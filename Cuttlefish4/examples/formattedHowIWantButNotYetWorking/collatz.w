# collatz.w, a Cuttlefish example written to show pattern and case matching of functions

collatz = fn:
    1 -> 1
    Int x
        | x %= 2 ->
            print x
            collatz (x / 2)
        | ->
            print x
            collatz (3 * x + 1)

print collatz 12509157
