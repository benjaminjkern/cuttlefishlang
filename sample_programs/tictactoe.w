###
Text-based TicTacToe written in Cuttlefish

By Ben Kern
###

Piece = enum:
    X
    O
    empty ->
        toString = fn: ' '

other = fn:
    X -> O
    O -> X

main = fn:
    board = [empty] ** (3,3)
    turn = X
    turnsTaken = 0

    while turnsTaken < 9:
        print '{turn}: Please enter position (X, Y)'

        validatePlacement = fn:
            String s ->
                validatePlacement String.parseAs(s, (Int, Int))
            (Int, Int) coords ->
                if coords in board.keys():
                    if board[coords] == empty:
                        return coords
                    print 'Position {placement} is taken!'
                else:
                    print '{placement} is not a valid position!'

                validatePlacement input()

        board[validatePlacement input()] = turn
        if win(board, turn):
            print '{turn} Wins!'
            return

        turn = other turn
        turnsTaken += 1
        print board

    print 'Tie Game'

win = fn: [Piece] ** (3,3) board, Piece turn ->
    For 