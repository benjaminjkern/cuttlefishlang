const inspect = (obj) => require("util").inspect(obj, false, null, true);

const CuttlefishError = (string) => {
    console.error(string);
    process.exit(-1);
};

module.exports = { inspect, CuttlefishError };
