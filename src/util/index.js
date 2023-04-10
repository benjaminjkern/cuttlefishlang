import { inspect as utilInspect } from "util";

export const inspect = (obj) =>
    console.log(utilInspect(obj, false, null, true)); // eslint-disable-line no-console

export const CuttlefishError = (lineNumber, string) => {
    console.error(`${lineNumber}: ${string}`);
    process.exit(-1);
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
