isExactlyThree = fn: n ->
    s = Math.sqrt n
    return s != n and s in Int and isPrime s
  
isPrime = fn: n, m ?= 2
    | m * m > n -> true
    | n %= m -> false
    | m == 2 -> isPrime n 3
    | -> isPrime n (m + 2)


# Automatically turn into this for primitive recursive
isPrime = fn: n ->
    m = 2
    repeat:
        if m * m > n: return true
        if n %= m: return false
        if m == 2: m = 3
        m = m + 2