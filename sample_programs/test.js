const fs = require("fs");

// forEach [1..100] prc: i -> forEach [1..i] prc: j -> print i % j

for (let i = 1; i <= 100; i++) {
    for (let j = 1; j <= 100; j++) {
        fs.writeFile("helloworld.txt", i % j, function(err) {
            if (err) return console.log(err);
            console.log("Hello World > helloworld.txt");
        });
    }
}