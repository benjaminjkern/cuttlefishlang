isExactlyThree = fn: n ->
    s = Math.sqrt n
    return s != n and s in Int and isPrime s
  
isPrime = fn: n, m ?= 2
    | m * m > n -> true
    | n %= m -> false
    | m == 2 -> isPrime n 3
    | -> isPrime n (m + 2)