quicksort = fn:
    [] -> []
    [Num] list -> quicksort list[1..][fn: $ < list[0]] ++ list[0] ++ quicksort list[1..][fn: $ >= list[0]]
