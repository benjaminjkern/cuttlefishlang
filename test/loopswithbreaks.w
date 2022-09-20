x = 0.5

while true:
    x = 1 * x * (1 - x)
    if x * 1000 < 3 and x * 1000 > 2:
        continue
    
    print x

    if x * 1000 < 2:
        break

