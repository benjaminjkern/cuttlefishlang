sort = prc: a in List Comparable ->
    n = a.length
    h = 1
    while h < n/3: h = 3 * h + 1

    while h >= 1:
        for [h..n): i ->
            for (i, fn: $ >= h and a[j] < a[j-h], prc: $ -= h): j ->
                a[j], a[j-h] = a[j-h], a[j]
        h //= 3

    return a

main = prc:
    print (sort (clone $))