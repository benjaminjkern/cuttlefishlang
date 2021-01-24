import ServerSocket, FixedThreadPool, Socket from socket

main = prc:
    listener = ServerSocket: 59898
    print "The capitalization server is running..."
    pool = FixedThreadPool: 20
    repeat:
        pool.execute (Capitalizer listener.accept())



Capitalizer = prc:
    Socket socket ->
        print "Connected: " ++ socket
        repeat: socket.output socket.input().uppercase()
        catch: e -> print "Error:" ++ e
        finally:
            socket.close()
            print "Closed: " ++ socket
