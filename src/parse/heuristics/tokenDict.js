import { subtract, intersect, makeSet } from "../../util/sets.js";

export const newTokenDict = (terminalToken = "") => {
    return { whitelist: makeSet(terminalToken.split("")) };
};

export const addTokenDicts = (a, b) => {
    if (typeof b === "string") return addToTokenDict(a, b);
    if (a.whitelist) {
        if (b.whitelist)
            return { whitelist: { ...a.whitelist, ...b.whitelist } };
        return { blacklist: subtract(b.blacklist, a.whitelist) };
    }
    if (b.whitelist) return addTokenDicts(b, a);
    return { blacklist: intersect(a.blacklist, b.blacklist) };
};

const addToTokenDict = (dict, terminalToken) => {
    return addTokenDicts(dict, newTokenDict(terminalToken));
};

export const isValidToken = (tokenDict, token) => {
    if (tokenDict.whitelist)
        return token.split("").every((char) => tokenDict.whitelist[char]);
    return token.split("").every((char) => !tokenDict.blacklist[char]);
};
