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

const printBoard = (board = BOARD) => {
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
    console.log(logs.join("\n"));

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

const shuffle = (list) => {
    const newList = [...list];
    for (let i = 0; i < list.length; i++) {
        const r = Math.floor(Math.random() * list.length);
        [newList[i], newList[r]] = [newList[r], newList[i]];
    }
    return newList;
};

const randomNums = (size) => {
    return shuffle(
        Array(size)
            .fill()
            .map((_, i) => i + 1)
    );
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
    const solutions = [];
    const stack = [board];
    while (stack.length) {
        const current = stack.pop();
        if (!testConstraints(current)) continue;
        if (checkFullBoard(current)) {
            solutions.push(current);
            if (solutions.length > 1) {
                logs.unshift("More than 1 solution!");
                return solutions;
            }
            continue;
        }
        const nextCoords = getNextEmptyCoords(current);
        stack.push(
            ...randomNums(boxSize * boxSize).map((n) =>
                newBoard(current, nextCoords, n)
            )
        );
    }
    // logs.unshift(`${solutions.length} solutions!`);
    return solutions;
};

const makePuzzle = (board) => {
    let solution = solve(board)[0];
    if (!solution) throw "Impossible!";

    const allCoords = Array(boxSize * boxSize)
        .fill()
        .reduce(
            (p, _, i) => [
                ...p,
                ...Array(boxSize * boxSize)
                    .fill()
                    .map((_, j) => [i, j]),
            ],
            []
        );

    let newAllCoords = [];
    while (allCoords.length) {
        console.log(allCoords.length);
        const blankCoords = allCoords.splice(
            Math.floor(Math.random() * allCoords.length),
            1
        )[0];
        const removedBlankBoard = newBoard(solution, blankCoords, undefined);
        const newSolutions = solve(removedBlankBoard);
        if (newSolutions.length === 1) {
            solution = removedBlankBoard;
            allCoords.push(...newAllCoords);
            newAllCoords = [];
            continue;
        }

        newAllCoords.push(blankCoords);
    }
    return solution;
};

let logs = [];
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
        process.stdin.pause();
        // console.log("Making puzzle...");
        logs = [];
        printBoard(solve(BOARD));
    }
    if (key && key.ctrl && key.name == "c") {
        process.stdin.pause();
    }
});
