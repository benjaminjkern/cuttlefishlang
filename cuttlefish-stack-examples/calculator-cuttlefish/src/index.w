# Ensures all files in this directory have access to these methods, without having to explicitly import them
globalExport '.' { View, Button, Text, Component, Screen } = import 'cuttlefish-ui'

server, { GET, POST } = (import 'cuttlefish-server').(Server, ResponseType) |> (fn: $(), fn:$)

# Implicit in the server is a router
server.route:
    # Can use ~ for root or . or .. for relative pathing, if you dont include any then it assumes it is a package
    '/', GET -> import '~/component/App'

server.styles = match:
    Screen screen
        | ->
            height = component.parent.height
            fontSize = 10
            backgroundColor = .black
            margin = 0
            padding = 0
            fontFamily = .sansSerif
        | screen.width >= 400 and screen.height >= 400 -> fontSize = 20
        | screen.width >= 500 and screen.height >= 500 -> fontSize = 30
        | screen.width >= 600 and screen.height >= 600 -> fontSize = 40
        | screen.width >= 800 and screen.height >= 800 -> fontSize = 50

# If you do it this way, all regular props from command line will get propogated to server.start
main = server.start