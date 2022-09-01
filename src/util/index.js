const inspect = (obj) => require("util").inspect(obj, false, null, true);

const CuttlefishError = (string) => {
    console.log(string);
    process.exit(-1);
};

module.exports = { inspect, CuttlefishError };
