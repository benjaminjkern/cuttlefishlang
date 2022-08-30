score_dealer = fn:
    {Card} cards -> # this one is a little weird but its doable probably

win = fn: player, dealer
    | player > 21 or player < dealer -> -1
    | player == dealer               ->  0
    | dealer > 21 or player > dealer ->  1

score = fn: cards ->
    values = map cards fn:
        card | card.value < 14 -> min(card.value, 10)
        card -> 11

    mySum = sum values
    while mySum > 21:
        if 11 not in cards: put mySum
        mySum -= 10

    put mySum


Q = fn:
    ({Card} hand, {Card} table, Card dealer, 'hit') ->
        cards_left
        expected
            cardsLeft
            fn: card -> win(
                score(hand + card),
                expected (cardsLeft - card) score_dealer
            )
    ({Card} hand, {Card} table, Card dealer, 'stay') ->
        win(
            score(hand),
            expected (deck - hand) scoreDealer
        )


hand, table, dealer

optimal = argmax {'hit', 'stay'} fn: action -> Q(hand, table, dealer, action)