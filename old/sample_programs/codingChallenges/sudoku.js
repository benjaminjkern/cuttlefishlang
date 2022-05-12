const checkUnique = (list) => {
    const seen = {};
    for (const element of list) {
        if (element === undefined) continue;
        if (seen[element]) return false;
        seen[element] = true;
    }
    return true;
};

const rowConstraint = (rowNum) => (board) => checkUnique(board[rowNum]);
const colConstraint = (colNum) => (board) =>
    checkUnique(board.map((row) => row[colNum]));
const boxConstraint = (boxX, boxY) => (board) =>
    checkUnique(
        Array(boxSize)
            .fill()
            .flatMap((_, i) =>
                Array(boxSize)
                    .fill()
                    .flatMap(
                        (_, j) => board[boxY * boxSize + i][boxX * boxSize + j]
                    )
            )
    );

const sumConstraint = (coords, sum) => (board) => {
    let runningSum = 0;
    for (const [x, y] of coords) {
        if (board[y][x] === undefined) return true;
        runningSum += board[y][x];
    }
    return runningSum === sum;
};

const testConstraints = (board) =>
    CONSTRAINTS.every((constraint) => constraint(board));

const checkFullBoard = (board) =>
    board.flat().every((value) => value !== undefined);

const getNextEmptyCoords = (board) => {
    for (const [y, row] of board.entries()) {
        for (const [x, value] of row.entries()) {
            if (value === undefined) return [x, y];
        }
    }
};

const newBoard = (board, [newX, newY], value) => {
    const nextBoard = [...board];
    nextBoard[newY] = [...board[newY]];
    nextBoard[newY][newX] = value;
    return nextBoard;
};

const printBoard = (board) => {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    for (const [y, row] of board.entries()) {
        if (y !== 0 && y % boxSize === 0)
            console.log(
                Array(boxSize)
                    .fill(Array(boxSize).fill("-").join(""))
                    .join("---")
            );
        console.log(
            row
                .map((v, x) => {
                    const matchCursor = +x === cursor.x && +y === cursor.y;
                    return `${x !== 0 && x % boxSize === 0 ? " | " : ""}${
                        matchCursor ? "\x1b[47m\x1b[30m" : ""
                    }${v === undefined ? " " : v}${
                        matchCursor ? "\x1b[0m" : ""
                    }`;
                })
                .join("")
        );
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
};

const addToBoard = (board, newBoard) => {
    for (const [y, row] of newBoard.entries()) {
        for (const [x, value] of row.entries()) {
            if (!value) continue;

            board[y][x] = value;
        }
    }
};

const boxSize = 3;

const BOARD = Array(boxSize * boxSize)
    .fill()
    .map(() =>
        Array(boxSize * boxSize)
            .fill()
            .map(() => undefined)
    );

const CONSTRAINTS = Array(boxSize * boxSize)
    .fill()
    .flatMap((_, i) => [
        rowConstraint(i),
        colConstraint(i),
        boxConstraint(i % boxSize, Math.floor(i / boxSize)),
    ]);

const solve = (board) => {
    const stack = [board];
    while (stack.length) {
        const current = stack.pop();
        if (!testConstraints(current)) continue;
        if (checkFullBoard(current)) return current;
        const nextCoords = getNextEmptyCoords(current);
        stack.push(
            ...Array(boxSize * boxSize)
                .fill()
                .map((_, i) => newBoard(current, nextCoords, i + 1))
        );
    }
    throw "Impossible!";
};

// addToBoard(BOARD, [
//     [0, 0, 0, 7, 0, 5, 8, 6, 0],
//     [0, 9, 0, 0, 0, 0, 0, 0, 3],
//     [5, 0, 0, 3, 6, 0, 0, 0, 0],
//     [2, 0, 5, 6, 1, 0, 4, 9, 8],
//     [4, 0, 3, 2, 7, 9, 6, 0, 5],
//     [9, 0, 1, 0, 0, 8, 0, 0, 0],
//     [6, 0, 0, 0, 0, 7, 0, 0, 0],
//     [8, 2, 0, 0, 0, 0, 1, 0, 6],
//     [0, 5, 0, 0, 2, 0, 9, 3, 0],
// ]);
// process.stdout.write("Something to be replaced");
// while (true);
const cursor = { x: 0, y: 0 };
printBoard(BOARD);

// make `process.stdin` begin emitting "keypress" events
require("keypress")(process.stdin);

// listen for the "keypress" event
process.stdin.on("keypress", function (ch, key) {
    if (ch && !key) {
        BOARD[cursor.y][cursor.x] = +ch;
        cursor.x++;
        if (cursor.x >= boxSize * boxSize) {
            cursor.x = 0;
            cursor.y++;
            if (cursor.y >= boxSize * boxSize) cursor.y--;
        }
    } else {
        switch (key.name) {
            case "right":
                cursor.x++;
                if (cursor.x >= boxSize * boxSize) {
                    cursor.x = 0;
                    cursor.y++;
                    if (cursor.y >= boxSize * boxSize) cursor.y--;
                }
                break;
            case "left":
                cursor.x--;
                if (cursor.x < 0) {
                    cursor.x = boxSize * boxSize - 1;
                    cursor.y--;
                    if (cursor.y < 0) cursor.y = 0;
                }
                break;
            case "up":
                cursor.y--;
                if (cursor.y < 0) cursor.y = boxSize * boxSize - 1;
                break;
            case "down":
                cursor.y++;
                if (cursor.y >= boxSize * boxSize) cursor.y = 0;
                break;
            case "backspace":
                if (BOARD[cursor.y][cursor.x])
                    BOARD[cursor.y][cursor.x] = undefined;
                else {
                    cursor.x--;
                    if (cursor.x < 0) {
                        cursor.x = boxSize * boxSize - 1;
                        cursor.y--;
                        if (cursor.y < 0) cursor.y = 0;
                    }
                    BOARD[cursor.y][cursor.x] = undefined;
                }
        }
    }
    printBoard(BOARD);
    if (key && key.name === "return") {
        printBoard(solve(BOARD));
        process.stdin.pause();
    }
    if (key && key.ctrl && key.name == "c") {
        process.stdin.pause();
    }
});
