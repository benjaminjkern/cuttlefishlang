# math standardized library

Num => Num derivative = fn: Num => Num f -> fn: Num x -> lim 0 fn: Num h -> (f(x + h) - f(x)) / h


lim = fn:
    a, f | p := lim 'left' a f == lim 'right' a f -> p
    'right', a, f