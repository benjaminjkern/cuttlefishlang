addSix = fn: x -> x + 6

x = 12

5(x)                    # 60
x(5)                    # 60

5 addSix x              # 90

(addSix * addSix) 10    # 22

(addSix ^ 4) 10         # 34




f = fn: x -> x - 8
g = fn: x, y -> x + y

f g 8 f 8

# f  g  8   f  8
# f (g (8) (f (8)))



Num = numlit | 'f' Num | 'g' Num Num









f = fn: x -> x + 6