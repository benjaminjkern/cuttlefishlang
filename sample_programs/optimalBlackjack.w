score_dealer = fn:
    {Card} cards -> # this one is a little weird but its doable probably

win = fn:
    (player, dealer) | player > 21 or player < dealer -> -1
                     | player == dealer               ->  0
                     | dealer > 21 or player > dealer ->  1

score = fn:
    {Card} cards ->
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
               

argmax = fn:
    x:xs, func | xs == None -> x
               |  -> 

sum = fn: 

sum 5 4 3 6 1 3 5

print 


Num sum = fn:
    [Num] a:rest, Num => Num fun -> fun a + sum rest fun
    [], _ -> 0
    a, b... -> sum a + sum b
    Num+ tup -> sum List tup
    [Num] a:xs -> a + sum xs
    Num a -> a


sum 34 [9, -1] (8, 9, 3)
(sum 34) + (sum [9, -1] (8, 9, 3))
34 + (sum [9, -1]) + (sum (8, 9, 3))
34 + (9 + sum [-1]) + (sum [8, 9, 3])
34 + (9 + (-1 + sum [])) + (8 + sum [9, 3])
34 + (9 + (-1 + 0)) + (8 + (9 + sum [3]))
34 + (9 + (-1 + 0)) + (8 + (9 + (3 + sum [])))
34 + (9 + (-1 + 0)) + (8 + (9 + (3 + 0)))

