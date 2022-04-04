const { newPattern } = require("./patterns");

const newStatementPattern = newPattern("Statement");

newStatementPattern(
    ["if", { type: "Bool" }, ":", { rawType: "Program" }],
    [bool, program]
);
newStatementPattern([
    "else",
    "if",
    { type: "Bool" },
    ":",
    { rawType: "Program" },
]);
newStatementPattern(["else", ":", { rawType: "Program" }]);
newStatementPattern([]);
