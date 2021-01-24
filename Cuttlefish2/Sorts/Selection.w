sort = prc: a in List Comparable ->
    n = a.length
    for [0..n): i ->
        min = i
        for (i..n): j ->
            if a[j] < a[min]: min = j
        a[i], a[j] = a[j], a[i]
    return a

main = prc:
    a = clone $
    print (sort (clone $))