for [8, 9, 0.9, 'hello']:
    Int i -> print i
    Num n -> print n * 10
    String s -> print "Whoah there cowboy"

###

8
9
9
Whoah there cowboy

###

f = fn: Int y, Int z -> y + z

f = fn: Int y -> fn: Int z -> y + z

