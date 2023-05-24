const createLogFunc =
    (owner, key) =>
    (...args) => {
        if (environment.log) return owner[key].bind(owner)(...args);
    };

export const environment = {
    exitOnError: true,
    log: true,
    colors: false,
    debug: true,
    debugHeuristics: false,
    debugHeuristicTests: true,
    inspect: console.log,
    consoleWrite:
        typeof process !== "undefined"
            ? createLogFunc(process.stdout, "write")
            : () => {},
    consoleLog: createLogFunc(console, "log"),
    consoleWarn: createLogFunc(console, "warn"),
    consoleError: createLogFunc(console, "error"),
};

export const consoleWrite = (...args) => environment.consoleWrite(...args);
export const consoleLog = (...args) => environment.consoleLog(...args);
export const consoleWarn = (...args) => environment.consoleWarn(...args);
export const consoleError = (...args) => environment.consoleError(...args);
