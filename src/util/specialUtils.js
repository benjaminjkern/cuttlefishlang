import { inspect as utilInspect } from "util";

export const inspect = (obj) =>
    console.log(utilInspect(obj, false, null, true)); // eslint-disable-line no-console
