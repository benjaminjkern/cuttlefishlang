roman = fn:
    Int n
        | n >= 1000 -> 'M'  ++ roman (n - 1000)
        | n >= 900  -> 'CM' ++ roman (n - 900)
        | n >= 500  -> 'D'  ++ roman (n - 500)
        | n >= 400  -> 'CD' ++ roman (n - 400)
        | n >= 100  -> 'C'  ++ roman (n - 100)
        | n >= 90   -> 'XC' ++ roman (n - 90)
        | n >= 50   -> 'L'  ++ roman (n - 50)
        | n >= 40   -> 'XL' ++ roman (n - 40)
        | n >= 10   -> 'X'  ++ roman (n - 10)
        | n >= 9    -> 'IX' ++ roman (n - 9)
        | n >= 5    -> 'V'  ++ roman (n - 5)
        | n >= 4    -> 'IV' ++ roman (n - 4)
        | n >= 1    -> 'I'  ++ roman (n - 1)
        | -> ''

roman = fn:
    Int n ->
        returnValue = ''
        while n > 0: for romanMap.keys().sort(-1): key ->
            if n >= key:
                returnValue ++= romanMap[key]
                n -= key
        return returnValue


romanMap = {1000: 'M', 900: 'CM', 500: 'D', 400: 'CD', 100: 'C', 90: 'XC', 50: 'L', 40: 'XL', 10: 'X', 9: 'IX', 5: 'V', 4: 'IV', 1: 'I'}

decimal = fn:
    String n
        | n in /M.*/  -> 1000 + decimal n[1..]
        | n in /CM.*/ -> 900  + decimal n[2..]
        | n in /D.*/  -> 500  + decimal n[1..]
        | n in /CD.*/ -> 400  + decimal n[2..]
        | n in /C.*/  -> 100  + decimal n[1..]
        | n in /XC.*/ -> 90   + decimal n[2..]
        | n in /L.*/  -> 50   + decimal n[1..]
        | n in /XL.*/ -> 40   + decimal n[2..]
        | n in /X.*/  -> 10   + decimal n[1..]
        | n in /IX.*/ -> 9    + decimal n[2..]
        | n in /V.*/  -> 5    + decimal n[1..]
        | n in /IV.*/ -> 4    + decimal n[2..]
        | n in /I.*/  -> 1    + decimal n[1..]
        | -> 0


# roman 539
# 'D' ++ roman 39
# 'X' ++ roman 29
# 'X' ++ roman 19
# 'X' ++ roman 9
# 'IX' ++ roman 0
# ''
# DXXXIX

# decimal 'DXXXIX'
# 500 + decimal 'XXXIX'
# 10 + decimal 'XXIX'
# 10 + decimal 'XIX'
# 10 + decimal 'IX'
# 9 + decimal ''
# 0
