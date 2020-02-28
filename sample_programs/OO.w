



data Anniversary = Birthday String Int Int Int       -- name, year, month, day
                 | Wedding String String Int Int Int -- spouse name 1, spouse name 2, year, month, day

johnSmith :: Anniversary
johnSmith = Birthday "John Smith" 1968 7 3

smithWedding :: Anniversary
smithWedding = Wedding "John Smith" "Jane Smith" 1987 3 4

anniversariesOfJohnSmith :: [Anniversary]
anniversariesOfJohnSmith = [johnSmith, smithWedding]
-- or
anniversariesOfJohnSmith = [Birthday "John Smith" 1968 7 3, Wedding "John Smith" "Jane Smith" 1987 3 4]

showDate :: Int -> Int -> Int -> String
showDate y m d = show y ++ "-" ++ show m ++ "-" ++ show d

showAnniversary :: Anniversary -> String

showAnniversary (Birthday name year month day) =
   name ++ " born " ++ showDate year month day

showAnniversary (Wedding name1 name2 year month day) =
   name1 ++ " married " ++ name2 ++ " on " ++ showDate year month day





Anniversary = type:
    Int year, Int month, Int day

Birthday = Anniversary type:
    String name

Wedding = Anniversary type:
    String name1
    String name2

Anniversary johnSmith = Birthday "John Smith" 1968 7 3

# or

# doing it this way allows for different ordering and exclusion of certain data
Anniversary smithWedding = Wedding:
    year = 1987
    name1 = "John Smith"
    day = 4
    month = 3
    # if you try to put in a property that doesnt exist it throws an error

smithWedding = Wedding "John Smith" "Jane Smith" 1987 3 4

[Anniversary] anniversariesOfJohnSmith = [johnSmith, smithWedding]
# or
anniversariesOfJohnSmith = [Birthday "John Smith" 1968 7 3, Wedding "John Smith" "Jane Smith" 1987 3 4]


Int ** 3 => String showDate :=
    y, m, d -> `{y}-{m}-{d}`

Anniversary => String showAnniversary :=
    Birthday b -> `{b.name} born {showDate b.year b.month b.day}`
    Wedding w -> `{w.name1} married {w.name2} on {showDate w.year w.month w.day}`


showAnniversary





exists = fn: a . b -> 