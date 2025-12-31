const testConstraints = (board) =>
    CONSTRAINTS.every(([[x1, y1], [x2, y2]]) => {
        return (
            board[y1][x1] === undefined ||
            board[y2][x2] === undefined ||
            board[y1][x1] !== board[y2][x2]
        );
    });

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

const CONSTRAINTS_SET = new Set();
const addToConstraintSet = (x1, y1, x2, y2) => {
    // Ensure duplicates aren't added
    const keys = [`${x1},${y1},${x2},${y2}`, `${x2},${y2},${x1},${y1}`];
    keys.sort();
    CONSTRAINTS_SET.add(keys[0]);
};
for (let i = 0; i < boxSize * boxSize; i++) {
    for (let j = 0; j < boxSize * boxSize; j++) {
        // Regular sudoku
        for (let k = j + 1; k < boxSize * boxSize; k++) {
            addToConstraintSet(i, j, i, k);
            addToConstraintSet(j, i, k, i);

            let startX = (i % boxSize) * boxSize;
            let startY = Math.floor(i / boxSize) * boxSize;
            addToConstraintSet(
                startX + (j % boxSize),
                startY + Math.floor(j / boxSize),
                startX + (k % boxSize),
                startY + Math.floor(k / boxSize)
            );
        }

        // Knights sudoku
        // if (i >= 1 && j >= 2) addToConstraintSet(i, j, i - 1, j - 2);
        // if (i >= 2 && j >= 1) addToConstraintSet(i, j, i - 2, j - 1);
        // if (i >= 1 && j < boxSize * boxSize - 2)
        //     addToConstraintSet(i, j, i - 1, j + 2);
        // if (i >= 2 && j < boxSize * boxSize - 1)
        //     addToConstraintSet(i, j, i - 2, j + 1);
        // if (i < boxSize * boxSize - 1 && j >= 2)
        //     addToConstraintSet(i, j, i + 1, j - 2);
        // if (i < boxSize * boxSize - 2 && j >= 1)
        //     addToConstraintSet(i, j, i + 2, j - 1);
        // if (i < boxSize * boxSize - 1 && j < boxSize * boxSize - 2)
        //     addToConstraintSet(i, j, i + 1, j + 2);
        // if (i < boxSize * boxSize - 2 && j < boxSize * boxSize - 1)
        //     addToConstraintSet(i, j, i + 2, j + 1);

        // Kings sudoku
        // if (i >= 1 && j >= 1) addToConstraintSet(i, j, i - 1, j - 1);
        // if (j >= 1) addToConstraintSet(i, j, i, j - 1);
        // if (i < boxSize * boxSize - 1 && j >= 1)
        //     addToConstraintSet(i, j, i + 1, j - 1);
        // if (i >= 1) addToConstraintSet(i, j, i - 1, j);
        // if (i < boxSize * boxSize - 1) addToConstraintSet(i, j, i + 1, j);
        // if (i >= 1 && j < boxSize * boxSize - 1)
        //     addToConstraintSet(i, j, i - 1, j + 1);
        // if (j < boxSize * boxSize - 1) addToConstraintSet(i, j, i, j + 1);
        // if (i < boxSize * boxSize - 1 && j < boxSize * boxSize - 1)
        //     addToConstraintSet(i, j, i + 1, j + 1);
    }
}
const CONSTRAINTS = [...CONSTRAINTS_SET].map((constraint) => {
    const [x1, y1, x2, y2] = constraint.split(",").map(Number);
    return [
        [x1, y1],
        [x2, y2],
    ];
});

const solve2 = (board) => {
    const solutions = [];
    const stack = [board];
    while (stack.length) {
        const current = stack.pop();
        if (!testConstraints(current)) continue;
        if (checkFullBoard(current)) {
            solutions.push(current);
            if (solutions.length > 1) {
                // logs.unshift("More than 1 solution!");
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

const solve = (board) => {
    const solveObj = {};
    solveObj.boardOptions = Array(boxSize * boxSize)
        .fill()
        .map(() =>
            Array(boxSize * boxSize)
                .fill()
                .map(() => ({}))
        );
    solveObj.totalSettled = 0;
    solveObj.settledCells = [];
    for (let x = 0; x < boxSize * boxSize; x++) {
        for (let y = 0; y < boxSize * boxSize; y++) {
            if (board[y][x] !== undefined) {
                solveObj.totalSettled += 1;
                solveObj.boardOptions[y][x][board[y][x]] = true;
                solveObj.settledCells.push([x, y]);
            } else {
                for (let n = 1; n <= boxSize * boxSize; n++)
                    solveObj.boardOptions[y][x][n] = true;
            }
        }
    }
    const solutions = [];
    const stack = [];

    const removeBoardOption = (x, y, n) => {
        if (!solveObj.boardOptions[y][x][n]) return;
        solveObj.boardOptions[y][x][n] = false;
        let count = 0;
        for (let m = 1; m <= boxSize * boxSize; m++) {
            if (solveObj.boardOptions[y][x][m]) {
                if (count >= 1) return;
                count++;
            }
        }
        if (count === 0) {
            // console.log(x, y, "Is now empty! Rolling back");
            if (!stack.length) throw "Impossible!";
            const {
                boardOptions,
                totalSettled,
                settledCells,
                guess: [gx, gy, gn],
            } = stack.pop();
            solveObj.boardOptions = boardOptions;
            solveObj.totalSettled = totalSettled;
            solveObj.settledCells = settledCells;
            removeBoardOption(gx, gy, gn);
            return;
        }
        if (count === 1) {
            solveObj.totalSettled += 1;
            // console.log(x, y, "Added as possible settled");
            solveObj.settledCells.push([x, y]);
        }
    };
    try {
        while (true) {
            printBoard(
                solveObj.boardOptions.map((row) =>
                    row.map((options) => {
                        let seen = false;
                        for (let n = 1; n <= 9; n++)
                            if (options[n]) {
                                if (seen) return undefined;
                                seen = n;
                            }
                        return seen;
                    })
                )
            );
            while (solveObj.settledCells.length) {
                const [x, y] = solveObj.settledCells.pop();
                const value = (() => {
                    for (let n = 1; n <= 9; n++)
                        if (solveObj.boardOptions[y][x][n]) return n;
                    throw "Shouldnt have gotten here!";
                })();
                // console.log("Settling", [x, y, value]);
                for (const [[x1, y1], [x2, y2]] of CONSTRAINTS) {
                    let nx, ny;
                    if (x1 === x && y1 === y) {
                        nx = x2;
                        ny = y2;
                    }
                    if (x2 === x && y2 === y) {
                        nx = x1;
                        ny = y1;
                    }
                    if (nx !== undefined) removeBoardOption(nx, ny, value);
                }
            }
            // console.log(solveObj.totalSettled, "total settled");
            if (
                solveObj.totalSettled ===
                boxSize * boxSize * boxSize * boxSize
            ) {
                // All good, lets go
                solutions.push(
                    solveObj.boardOptions.map((row) =>
                        row.map((options) => {
                            for (let n = 1; n <= 9; n++)
                                if (options[n]) return n;
                            throw "Shouldn't have gotten here!";
                        })
                    )
                );
                if (solutions.length >= 2 || stack.length === 0)
                    return solutions;
                const {
                    boardOptions,
                    totalSettled,
                    guess: [gx, gy, gn],
                } = stack.pop();
                solveObj.boardOptions = boardOptions;
                solveObj.totalSettled = totalSettled;
                removeBoardOption(gx, gy, gn);
                continue;
            }

            let lowestNumberAvailable;
            // Save position and make random guess
            startGuess: for (let x = 0; x < boxSize * boxSize; x++) {
                for (let y = 0; y < boxSize * boxSize; y++) {
                    const available = [];
                    for (let m = 1; m <= boxSize * boxSize; m++) {
                        if (solveObj.boardOptions[y][x][m]) {
                            available.push(m);
                        }
                    }
                    if (available.length === 1) continue;
                    if (available.length === 2) {
                        lowestNumberAvailable = [x, y, available];
                        break startGuess;
                    }
                    if (
                        !lowestNumberAvailable ||
                        available.length < lowestNumberAvailable[2].length
                    ) {
                        lowestNumberAvailable = [x, y, available];
                    }
                }
            }

            const [x, y, available] = lowestNumberAvailable;

            const r = Math.floor(Math.random() * available.length);

            stack.push({
                boardOptions: solveObj.boardOptions.map((row) =>
                    row.map((options) => ({ ...options }))
                ),
                totalSettled: solveObj.totalSettled,
                settledCells: [...solveObj.settledCells],
                guess: [x, y, available[r]],
            });
            // console.log("Guess", [x, y, available[r]]);
            solveObj.totalSettled += 1;

            solveObj.boardOptions[y][x] = { [available[r]]: true };

            solveObj.settledCells.push([x, y]);
        }
    } catch (err) {
        if (err === "Impossible!") return [];
        throw err;
    }
};

const makePuzzle = (board, numPossiblyRedundant = 0) => {
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
    while (allCoords.length > numPossiblyRedundant) {
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
        // process.stdin.pause();
        logs = [];
        printBoard(makePuzzle(BOARD));
    }
    if (key && key.ctrl && key.name == "c") {
        process.stdin.pause();
    }
});
