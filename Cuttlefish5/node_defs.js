const inspect = (object) =>
    console.log(require("util").inspect(object, false, null, true));

class Program {
    constructor(body) {
        this.body = body;
    }
    analyze() {
        const context = new Set();
        this.body.forEach((expression) => expression.analyze(context));
        return this;
    }
    run() {
        const context = {};
        const names = {};
        this.body.forEach((statement) => statement.run(context, names));
    }
}

class Expression {
    constructor(sourceString) {
        this.sourceString = sourceString;
    }
    analyze() {
        return this;
    }
    run() {
    }
}

module.exports = {
    Program,
    Expression
};