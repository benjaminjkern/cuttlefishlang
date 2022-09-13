const inspect = (obj) => require("util").inspect(obj, false, null, true);

const CuttlefishError = (string) => {
    console.error(string);
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

module.exports = { inspect, CuttlefishError };
