const RULES = require("../expressions");

const isTerminal = (token) => typeof token !== "object";

module.exports = { isTerminal };
