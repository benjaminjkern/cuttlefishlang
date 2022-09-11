const { subtract, intersect, makeSet } = require("../util/sets");

const newTokenDict = () => {
    return { whitelist: {} };
};

const addTokenDicts = (a, b) => {
    if (a.whitelist) {
        if (b.whitelist)
            return { whitelist: { ...a.whitelist, ...b.whitelist } };
        return { blacklist: subtract(b.blacklist, a.whitelist) };
    }
    if (b.whitelist) return addTokenDicts(b, a);
    return { blacklist: intersect(a.blacklist, b.blacklist) };
};

const addToTokenDict = (dict, terminalToken) => {
    return addTokenDicts(dict, { whitelist: makeSet(terminalToken.split("")) });
};

const isValidToken = (tokenDict, token) => {
    if (tokenDict.whitelist)
        return token.split("").every((char) => tokenDict.whitelist[char]);
    return token.split("").every((char) => !tokenDict.blacklist[char]);
};

module.exports = { newTokenDict, addTokenDicts, addToTokenDict, isValidToken };
