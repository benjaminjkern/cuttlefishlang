# math standardized library

Num => Num derivative = fn: Num => Num f -> fn: Num x -> lim 0 fn: Num h -> (f(x + h) - f(x)) / h


lim = fn:
    a, f | p := lim 'left' a f == lim 'right' a f -> p
    'right', a, f


A_Star = fn: (start, goal, h) ->
    openSet = {start}
    cameFrom = Map()
    gScore = Map(default: Inf)
    gScore[start] = 0
    fScore = Map(default: Inf)
    fScore[start] = h(start)

    while openSet is not empty:
        current = openSet.poll()
        if current == goal:
            return reconstruct_path(cameFrom, current)

        for neighbor in current.neighbors:
            tentative_gScore = gScore[current] + d(current, neighbor)
            if tentative_gScore < gScore[neighbor]:
                cameFrom[neighbor] = current
                gScore[neighbor] = tentative_gScore
                fScore[neighbor] = gScore[neighbor] + h(neighbor)
                if neighbor not in openSet:
                    openSet.add(neighbor)
    return 'failed'


f = fn:
    (openSet, gScore, fScore, cameFrom) | openSet is not empty, current := openSet[0] == goal -> reconstruct_path(cameFrom, current)
            | openSet is not empty -> f(g(current.neighbors))

g = fn: neighbor : tail, current | tentative_gScore := gScore[current] + d(current, neighor), tentative_gScore < gScore[neighbors] ->






main = prc:
    owner = findOwner()
    doTaxes(owner)
    print 'doin your taxes, boss'
    waitForThanks()



doTaxes = prc:
    Person p | p.debt > 1000 or p.name == 'Karen' ->
        print 'Aint nothin I can do about that'
    Person p ->
        p.debt = 0

    Monster m | m.color == 'green' -> m.eyeballs = 1
    Monster m | m.hasFur -> m.scream()

    Dog d ->
        print 'Dogs dont have to do taxes!'
        d.love += 1
    Dog d | d.love > 100 ->
        d.love -= 1
    # don't worry this will never happen because dogs will always match above

