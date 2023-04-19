import { inspect as utilInspect } from "util";
import { environment } from "./environment.js";

import "colors";

export const inspect = (obj) =>
    console.log(utilInspect(obj, false, null, true)); // eslint-disable-line no-console

export const colorString = (string, color) => {
    if (environment.colors) return string[color];
    return string;
};
