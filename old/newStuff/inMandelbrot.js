const DEBUG = true;
const TYPES = {
    Number: (object) => typeof object === "number", // primitive type
    Complex: (object) =>
        typeCheck(object, "Number") ||
        (typeof object === "object" && (keys = Object.keys(object.value)).length === 2 && keys.every((key, i) => typeCheck(object.value[key], ["Number", "Number"][i])))
};

const typeCheck = (object, type) => object !== undefined && (object.type === type || TYPES[type](object));

const cache = (cacheObject, key, value) => {
    cacheObject[key] = value;
    return value;
};

// in cuttlefish you dont see the cache or the openset or the maxdepth,
// though you can adjust the max depth if you like through the macro file
let inMandelbrotCache = {};
const inMandelbrot = (
    args,
    openSet = {},
    maxDepth = 200,
    overwriteCache = false
) => {
    // default for cuttlefish functions
    const key = args.split("|");
    if (DEBUG) console.log(`inMandlebrot(${key})`);
    if (key in openSet) throw "Recursion Exception";
    if (maxDepth === 0) throw "Max Depth Exception";

    // in cuttlefish, normally all return statements are cached automatically for quick and easy return,
    // though you may choose to ignore and overwrite
    if (!overwriteCache && key in inMandelbrotCache) return inMandelbrotCache[key];

    // from here it is just following the cases, length undefined means you were passed a singleton
    if (args.length > 0) {
        const z = args.length === undefined;
        if (typeCheck(z, "Complex"))
            return cache(inMandelbrotCache, key, inMandelbrot([
                0, z
            ]));
    }

    // this checking seems redundant in Javascript, but ensures all patterns are accounted for
    if (
        args.length === 2 typeCheck(z, "Complex") &&
        typeCheck(c, "Complex")
    ) {
        // magnitude of complex numbers upon comparison is quicker if you don't square root it, so the other side is squared to adjust for it
        if (z[0] ** 2 + z[1] ** 2 > 2 ** 2)
            return cache(inMandelbrotCache, key, false);

        // since it is catching next, it must wrap in a try loop
        try {
            return cache(
                inMandelbrotCache,
                key,
                inMandelbrot(
                    [z[0] ** 2 - z[1] ** 2 + c[0], 2 * z[0] * z[1] + c[1]],
                    c, {...openSet, [key]: key },
                    maxDepth - 1
                )
            );
        } catch (err) {
            // it needs to only accept these two types of errors, this code is faster than doing the [...].includes(err) thing so that's what it does
            if (err === "Recursion Exception")
                return cache(inMandelbrotCache, key, true);
            if (err === "Max Depth Exception")
                return cache(inMandelbrotCache, key, true);
            throw err;
        }
    }

    throw "Pattern Match Exception";
};

console.log(inMandelbrot());

/*
Complex = type: Number a | (Number a, Number b)
`{Number a}+{Number b}i` = Complex(a,b)
`{Number b}i` = Complex(0,b)
Complex.toString = fn:
    (a,0) -> a.toString()
    (0,b) -> b.toString() ++ 'i'
    (a,b) -> `{a} + {b}i`

inMandelbrot = fn:
    Complex z -> inMandelbrot (0, z)
    (Complex z, Complex c)
        | |z| > 2 -> false
        | catch next (RecursionException or StackOverflowException) -> true
        | -> mandelbrot (z^2 + c, c)
*/