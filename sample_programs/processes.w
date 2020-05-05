# Statement = 'print' String | 'print' Number | 'put'? Object | Pattern '=' Object
# Object = String | Number | Process

my_proc = prc:
    () ->
        print x + 12
        self()
    0 -> x += 1
    

# Process += 'my_proc' (emptyTuple | Int | Object)

x = 5

my_proc()
my_proc 0
my_proc 0

On a single thread, this will run 17 and then it will keep printing 19





tictactoe = srv:
    initialize board
    x goes first

    do until game is over:
        wait for input
        makeMove
        check if game is over