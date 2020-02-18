###
Text-based TicTacToe written in Cuttlefish

By Ben Kern
###

Piece = type: empty | X | O

other = fn:
    X -> O
    O -> X
    _ -> empty

toString ++ fn:
    Piece X -> 'X'
    Piece O -> 'O'
    Piece -> 'empty'

main = prc:
    board = [Piece empty] ** (3,3)
    turn = Piece X
    turns_taken = 0

    while turns_taken < 9 prc:
        print `{turn}: Please enter position (1-9)`

        placement = fn:
            if board[$ - 1] is undefined:
                print `{placement} is not a valid position!`
                put placement input()
            if board[$ - 1] not empty:
                print `Position {placement} is taken!`
                put placement input()
            return $

        board[placement input()] = turn
        if win board turn:
            print `{turn} Wins!`
            break

        turn = other turn
        turns_taken += 1
        print board

    print 'Tie Game'

win := board, turn -> find board [turn]**3, -1 not null