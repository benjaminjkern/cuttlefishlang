Piece = Enum: Empty, X, O

toString = fn:
    Empty _ -> ' '
    X _ -> 'X'
    O _ -> 'O'

drawBoard = fn: board -> join '\n---------\n' map board fn: row -> join ' | ' row

join String [String]

board = 
