import { consoleError, consoleWarn, environment } from "./environment.js";

export const colorString = (string, color) => {
    if (environment.colors) return string[color];
    return string;
};

const ALLOWED_ERROR_TYPES = [
    "Error",
    "Parsing Error",
    "Preparsing Error",
    "Runtime Exception",
];
export const CuttlefishError = (
    errorString,
    lineNumber,
    errorType = "Error"
) => {
    if (!ALLOWED_ERROR_TYPES.includes(errorType))
        consoleWarn(`Warning: ${errorType} is not an allowed error type.`);
    const error = `${errorType}: ${
        lineNumber ? `Line ${lineNumber}: ` : ""
    }${errorString}`;
    consoleError(error);
    if (environment.exitOnError) process.exit(-1);
    else throw error;
};

const scrambleList = (list) => {
    const newList = [...list];
    for (let i = 0; i < newList.length; i++) {
        const r = Math.floor(Math.random() * newList.length);
        [newList[i], newList[r]] = [newList[r], newList[i]];
    }
    return newList;
};

export const deepCopy = (object) => {
    if (typeof object !== "object") return object;
    if (object.length !== undefined) return object.map(deepCopy);
    const newObject = {};
    for (const key in object) {
        newObject[key] = deepCopy(object[key]);
    }
    return newObject;
};

let debugIndentation = 0;
export const debugFunction =
    (func, name = "f", includeArgs, resultEnd) =>
    (...args) => {
        const tabWidth = Array(debugIndentation).fill("   ").join("");
        console.log(
            `${tabWidth}${name}`,
            ...args
                .map((arg, i) => {
                    if (!includeArgs) return arg;
                    if (!includeArgs[i]) return null;
                    if (typeof includeArgs[i] === "function")
                        return includeArgs[i](arg);
                    return arg;
                })
                .filter((x) => x !== null),
            "{"
        );
        debugIndentation++;
        const result = func(...args);
        debugIndentation--;
        console.log(
            `${tabWidth}}`,
            "->",
            result.error
                ? result.error
                : resultEnd
                ? typeof resultEnd === "function"
                    ? resultEnd(result)
                    : resultEnd
                : result
        );
        return result;
    };
