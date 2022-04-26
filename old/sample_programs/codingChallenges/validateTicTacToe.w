

validateTicTacToe = fn: ([String | length == 3] | length == 3) board ->
    countX = board.sum(fn: line -> line.find("X").length)
    countO = board.sum(fn: line -> line.find("O").length)

    if countX - countO >= 2: return false

    # Needs to also check for no multiple 3s in a row

    return true