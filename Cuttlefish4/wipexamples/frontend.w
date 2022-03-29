Element = type()

# This defines an instantiator that puts a list of elements and then calls it content
Page = type: String title => Element* content

# Bazar pages automatically attach a navbar and footer to a page
BazarPage = type Page:
    Navbar this.title

    for this.content: element -> put element

    Footer()


main = BazarPage "Welcome!": Int i -> 
    h1 "Welcome to Bazar!"

    (span: color = i %= 0 ? "red" : "blue") "Howdy"

    "Bazar is a cool marketplace and you should check it out!"

    (a "https://bazar-app.com/download") "Click here to download Bazar!"

for [1..]: i -> htmlDraw (main i)

