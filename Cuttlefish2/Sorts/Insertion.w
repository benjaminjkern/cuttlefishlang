sort = prc: a in List Comparable ->
    n = a.length
    for [1..n): i ->
        for (i, fn: $ > 0 and a[j] < a[j-1], prc: $ -= 1): j ->
            a[j], a[j-1] = a[j-1], a[j]
    return a

main = prc:
    print (sort (clone $))