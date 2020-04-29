fib = fn:
    () -> fib(1,1)
    (a,b) -> a ++ fib(b, a+b)

fibList = fib()

fibList[5...] # [8, 13, 21, 34, 55, 89, ...]

fibList[...5] # [1, 1, 2, 3, 5]

fibList[< 10] # [1, 1, 2, 3, 5, 8, (This will keep running forever since it thinks theres always a possibility of being less than 5)

fibList[...100][< 10] # [1, 1, 2, 3, 5, 8] (This will stop since it only checks the first 100)

fibList[fn: x | x < 10 -> x] # [1, 1, 2, 3, 5, 8] (This looks terse but it makes sense)

#! List +> (Object a) '++' (List b) | 
#! Num +> [(Num a)] '%' (Num b) <'a % b'> | [(Num a)] '%' (Num b) <'a * b'>
#! Num +> [(Num a)] '+' (Num b) |> 'a + b'



weirdFunc = fn:
    x | x < 12 -> x + 5
    x, y | x + y % 3 == 0 -> y