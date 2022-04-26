const grid = [
    [-1, -1, 1, 1, 1, -1, -1],
    [-1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [-1, 1, 1, 1, 1, 1, -1],
    [-1, -1, 1, 1, 1, -1, -1],
];

// small grid (There is a solution for this which is kinda crazy)
// const grid = [
//     [1, 1, 1, 1, 1],
//     [1, 1, 1, -1, 1],
//     [1, 0, 1, 1, 1],
//     [1, 1, 1, 1, 1],
//     [1, 1, 1, 1, 1],
// ];
const height = grid.length;
const width = grid[0].length;

const doSwaps = (grid, swaps) => {
    const newGrid = grid.map((row) => [...row]);
    swaps.forEach((swap) => {
        newGrid[swap[1]][swap[0]] = swap[2];
    });
    return newGrid;
};

const getPos = (pos, dir, amount = 1) => {
    switch (dir) {
        case "U":
            return [pos[0], pos[1] - amount];
        case "D":
            return [pos[0], pos[1] + amount];
        case "L":
            return [pos[0] - amount, pos[1]];
        case "R":
            return [pos[0] + amount, pos[1]];
        default:
            throw "Something went wrong!";
    }
};

const makeKey = (grid) => grid.join(";");

const nextMove = (dir) => {
    switch (dir) {
        case "U":
            return "D";
        case "D":
            return "L";
        case "L":
            return "R";
        case "R":
            return null;
        default:
            throw "Something went wrong!";
    }
};

const countCache = {};
const countOnes = (grid) => {
    const key = makeKey(grid);
    if (countCache[key]) return countCache[key];
    countCache[key] = grid.reduce(
        (p, row) => p + row.reduce((p, c) => p + (c === 1 ? 1 : 0), 0),
        0
    );
    return countCache[key];
};

const cache = {};
const findSoln = (grid) => {
    const key = makeKey(grid);
    if (cache[key] !== undefined) {
        return cache[key];
    }

    if (countOnes(grid) === 1) {
        cache[key] = [];
        return cache[key]; // success
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pos = [x, y];
            if (space(grid, pos) === 1) {
                let move = "U";
                while (move != null) {
                    const nextPos = getPos(pos, move);
                    const nextPos2 = getPos(pos, move, 2);
                    const next = space(grid, nextPos);
                    const next2 = space(grid, nextPos2);
                    if (next === 1 && next2 === 0) {
                        const solution = findSoln(
                            doSwaps(grid, [
                                [...pos, 0],
                                [...nextPos, 0],
                                [...nextPos2, 1],
                            ])
                        );
                        if (solution !== null) {
                            cache[key] = [
                                [x, y, move], ...solution
                            ];
                            return cache[key];
                        }
                    }
                    move = nextMove(move);
                }
            }
        }
    }
    cache[key] = null;
    return cache[key];
};

const space = (grid, pos) => {
    if (
        pos[0] >= grid[0].length ||
        pos[1] >= grid.length ||
        pos[0] < 0 ||
        pos[1] < 0
    )
        return -1;
    return grid[pos[1]][pos[0]];
};

const beep = require("beepbeep");
console.log(findSoln(grid));
beep(100, 1000);