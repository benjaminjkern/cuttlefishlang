const recursiveCache = {};
const addToCache = (key, value) => {
    recursiveCache[key] = value;
    return value;
};
const ack = (m, n) => {
    const key = `${m},${n}`;
    if (recursiveCache[key] !== undefined) return recursiveCache[key];
    if (m === 0) return addToCache(key, n + 1);
    if (n === 0) return addToCache(key, ack(m - 1, 1));
    return addToCache(key, ack(m - 1, ack(m, n - 1)));
};

const ack2 = (m, n) => {
    const stack = [];
    const cache = {};
    let returnValue;
    while (true) {
        // console.log(`${Array(stack.length).fill(" ").join("")}A(${m}, ${n})`);
        const currentKey = `${m},${n}`;
        if (m === 0) {
            returnValue = n + 1;

            if (stack.length === 0) return returnValue;
            const [oldM, oldN] = stack.pop().split(",").map(Number);
            m = oldM;
            n = oldN;

            cache[currentKey] = returnValue;
            continue;
        }
        if (n === 0) {
            const newKey = `${m - 1},1`;
            if (cache[newKey] !== undefined) {
                returnValue = cache[newKey];

                if (stack.length === 0) return returnValue;
                const [oldM, oldN] = stack.pop().split(",").map(Number);
                m = oldM;
                n = oldN;

                cache[currentKey] = returnValue;
                continue;
            }
            stack.push(currentKey);
            m -= 1;
            n = 1;
            continue;
        }
        const firstKey = `${m},${n - 1}`;
        if (cache[firstKey] !== undefined) {
            const secondKey = `${m - 1},${cache[firstKey]}`;
            if (cache[secondKey] !== undefined) {
                returnValue = cache[secondKey];

                if (stack.length === 0) return returnValue;
                const [oldM, oldN] = stack.pop().split(",").map(Number);
                m = oldM;
                n = oldN;

                cache[currentKey] = returnValue;
                continue;
            }
            stack.push(currentKey);
            m -= 1;
            n = cache[firstKey];
            continue;
        }
        stack.push(currentKey);
        n -= 1;
    }
};

// const s = Date.now();
// for (let m = 0; m <= 3; m++) {
//     for (let n = 0; n <= 12; n++) {
//         console.log(ack2(m, n));
//     }
// }
// console.log(Date.now() - s);

// console.log(ack2(3n, 19n));
/**
 * This one is from chatgpt, took several tries but it did get it right
 */
function ackermann(m, n, { maxSteps = 1_000_000_000_000 } = {}) {
    const memo = new Map();
    const stack = [{ type: "call", m, n }];
    let steps = 0;
    let result = null;

    const key = (m, n) => `${m},${n}`;

    while (stack.length > 0) {
        if (++steps > maxSteps) {
            throw new Error("Ackermann step limit exceeded");
        }

        const frame = stack.pop();

        switch (frame.type) {
            case "call": {
                const { m, n } = frame;
                const k = key(m, n);

                // Memo hit
                if (memo.has(k)) {
                    result = memo.get(k);
                    break;
                }

                // Base case
                if (m === 0) {
                    result = n + 1;
                    memo.set(k, result);
                    break;
                }

                // A(m-1, 1)
                if (n === 0) {
                    stack.push({ type: "ret", m, n });
                    stack.push({ type: "call", m: m - 1, n: 1 });
                    break;
                }

                // A(m-1, A(m, n-1))
                stack.push({ type: "ret", m, n });
                stack.push({ type: "cont", m });
                stack.push({ type: "call", m, n: n - 1 });
                break;
            }

            case "cont": {
                // result === A(m, n-1)
                stack.push({ type: "call", m: frame.m - 1, n: result });
                break;
            }

            case "ret": {
                // result is now A(m,n)
                memo.set(key(frame.m, frame.n), result);
                break;
            }
        }
    }

    return result;
}

// console.log(ack2(3, 19));

console.log(ackermann(3, 19));
