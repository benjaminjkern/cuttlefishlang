Piece = enum: X, O, empty

nextPiece = fn:
    X -> O
    Piece _ -> X

board = [empty] ** (3,3)

playMove = prc: Piece turn, (Int x, Int y)
    | board[x, y] == empty ->
        board[x, y] = turn
        if checkIfWin turn:
            print turn ++ " wins!"
            return 1
        return 0
    | ->
        print "You cannot place there!"
        return -1

checkIfWin = fn: Piece p ->
    # Check if the piece won given the board

displayBoard = prc:
    # Do something to display the board




main = prc:
    turn = empty
    lastValid = 0

    do
        if lastValid == 0
            displayBoard()
            turn = nextPiece turn
        pos = prompt "Where do you want to play? "
    while (lastValid := playMove turn pos) != 1