{ sum } = import 'math'

validateTicTacToe = fn: board ->
    countX = (sum board): line -> line.find("X").length
    countO = (sum board): line -> line.find("O").length

    if countX - countO >= 2: return false

    # Needs to also check for no multiple 3s in a row

    return true