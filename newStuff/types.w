length                  :: [a] -> Integer
length []               =  0
length (x:xs)           =  1 + length xs

head                    :: [a] -> a
head (x:xs)             =  x
tail                    :: [a] -> [a]
tail (x:xs)             =  xs

data Bool               = False | True

data Point a            = Pt a a

data Tree a             = Leaf a | Branch (Tree a) (Tree a) 

fringe                     :: Tree a -> [a]
fringe (Leaf x)            =  [x]
fringe (Branch left right) =  fringe left ++ fringe right

type String             = [Char]
type Person             = (Name,Address)
type Name               = String
data Address            = None | Addr String

type AssocList a b              = [(a,b)]

#==========================================================

Int length = fn:
    [] -> 0
    x:xs -> 1 + length xs

head = fn:
    x:xs -> x
tail = fn:
    x:xs -> xs

Bool = data
true = new Bool
false = new Bool

Point = data A: A a, A b
    
Tree = data A
Leaf = Tree: A a
Branch = Tree: A a, A b

fringe = fn:
    Leaf x -> [x]
    Branch x -> fringe x a ++ fringe x b

String = [Char]
Person = (Name, Address)
Name = String
Address = data
None = Address
Addr = Address:
    String a

AssocList = type a b: [(a, b)]