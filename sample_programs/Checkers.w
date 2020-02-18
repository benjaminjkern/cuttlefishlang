main = srv: 
    () ->   
        store player0 = client 0, player1 = client 1
        self ++ player0
        self ++ player1
    (x,move) ->
        state[x] move

client = srv:
    Int player -> 
        store (player, newboard())
        case player
            0 -> self()
            1 -> #/ No op /#

        # This can be if !player: self()
    () -> 
        move = parsemove input()
        case (validplay move,move)
            ((xi, yi), (xo, yo)) -> #/ No op /#
            (x, Missing) -> self()
            (0, x) -> self()
        store board = play(move, board, player)
        put move

play = fn:
    (((xi, yi), (xo, yo)), board, player) ->
        #/ Piece-placing logic here /#
        put board

newboard = fn:
    () -> board = [-1] ** (8,8)
          #/ Boring board setup here #/
          put board


parsemove = fn:
    String string -> parsemove regex_match `\d+`
    [String] matches -> parsemove (len matches, matches)
    (4,[xi:[yi:[xo:[yo]]]]) -> put map str2int (xi, yi, xo, yo)
    x -> Missing    

validplay = fn:
    (board, player, 0, ((xi, yi), (xo, yo))) -> 
        dir = direction player
        case all(
                board[yo][xo] == -1,
                board[yi][xi] == player,
                yo < 8,
                xo < 8,                
                any (
                    yo == yi + dir and (xo == xi + 1 or xo == xi - 1),
                    yo == yi + dir * 2 and (xo == xi + 2 or xo == xi - 2) and board[(yo + yi) / 2][(xo + xi) / 2] == not player
                )
            )
    (board, player, 1, move) ->
        validplay (board, player, 0, move) or (board, not player, 0, move)
        
direction = fn:
    0 -> +1
    1 -> -1
            
            
        
