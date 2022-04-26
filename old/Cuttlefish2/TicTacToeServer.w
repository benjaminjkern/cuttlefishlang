
main = prc: String* args
    listener = ServerSocket: 58901
    pool = FixedThreadPool: 200

    print "Tic Tac Toe Server is Running..."

    repeat:
        game = Game:()
        pool.execute(game.Player: listener.accept(); 'X'))
        pool.execute(game.Player: listener.accept(); 'X'))

Game = type:
    [Player] board = [null] ** 9
    Player currentPlayer

    hasWinner = fn:
        (board[0] != null && board[0] == board[1] && board[0] == board[2])
            || (board[3] != null && board[3] == board[4] && board[3] == board[5])
            || (board[6] != null && board[6] == board[7] && board[6] == board[8])
            || (board[0] != null && board[0] == board[3] && board[0] == board[6])
            || (board[1] != null && board[1] == board[4] && board[1] == board[7])
            || (board[2] != null && board[2] == board[5] && board[2] == board[8])
            || (board[0] != null && board[0] == board[4] && board[0] == board[8])
            || (board[2] != null && board[2] == board[4] && board[2] == board[6])

    boardFilledUp = fn: matchAll board with fn: p -> p != null

    move = prc:
        Int location, Player player
            | player == currentPlayer && player.opponent != null && board[location] == null ->
                board[location] = currentPlayer
                currentPlayer = currentPlayer.opponent

    Player = (type prc):
        Socket! socket
        char! mark
        Player opponent
        run = prc:

            # Setup
            output("WELCOME " ++ mark)
            if mark == 'X':
                currentPlayer = self
                scoket.output "MESSAGE Waiting for opponent to connect"
            else:
                opponent = currentPlayer
                opponent.opponent = self
                opponent.output "MESSAGE Your move"

            #Process Commands
            repeat:
                command = socket.input()
                if match command with /$QUIT/:
                    break
                if match command with /$MOVE/:
                    processMoveCommand(s/$MOVE// command)

            catch: e -> print e.stackTrace
            finally: ()
                | opponent != null && opponent.socket.output != null ->
                    opponent.socket.output "OTHER_PLAYER_LEFT"
                    continue
                | -> socket.close()
        processMoveCommand = prc: Int location ->
            move location self
            socket.output "VALID_MOVE"
            opponent.socket.output("OPPONENT_MOVED" ++ location)
            if hasWinner():
                socket.output "VICTORY"
                opponent.socket.output "DEFEAT"
            else if boardFilledUp():
                socket.output "TIE"
                opponent.socket.output "TIE"
            catch: IllegalStateException e -> socket.output ("MESSAGE " ++ e.message)