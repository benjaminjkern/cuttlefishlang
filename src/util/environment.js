export const environment = {
    exitOnError: true,
    log: true,
};

const createLogFunc =
    (owner, key) =>
    (...args) => {
        if (environment.log) return owner[key].bind(owner)(...args);
    };

export const consoleWrite = createLogFunc(process.stdout, "write");
export const consoleLog = createLogFunc(console, "log");
export const consoleWarn = createLogFunc(console, "warn");
export const consoleError = createLogFunc(console, "error");
