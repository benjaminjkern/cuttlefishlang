fn: x -> if x > 9: print x; else print "WTF"


okay         =fn:

{
print "This function is kind of wack"; print "I know, right?";
return "That's okay though"
f = fn: f -> f f
}

# can now do one liners

quicksort = fn: [] -> []; [Num] list -> quicksort list[1..][fn: $ < list[0]] ++ list[0] ++ quicksort list[1..][fn: $ >= list[0]]