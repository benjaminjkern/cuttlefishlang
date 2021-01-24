const inspect = (object) =>
    console.log(require("util").inspect(object, false, null, true));

class Block {
    constructor(processes) {
        this.processes = processes;
    }
}

class Assignment {
    constructor(id, expression) {
        Object.assign(this, { id, expression });
    }
}

class If {
    constructor(condition, ifTrue, ifFalse) {
        Object.assign(this, { condition, ifTrue, ifFalse });
    }
}

class While {
    constructor(condition, loop) {
        Object.assign(this, { condition, loop });
    }
}

class For {
    constructor(iterator, collection, loop) {
        Object.assign(this, { iterator, collection, loop });
    }
}

class Return {
    constructor(expression) {
        this.expression = expression;
    }
}

class TernaryExp {
    constructor(condition, ifTrue, ifFalse) {
        Object.assign(this, { condition, ifTrue, ifFalse });
    }
}

class BinaryExp {
    constructor(left, op, right) {
        Object.assign(this, { left, op, right });
    }
}

class Unary {
    constructor(exp, op) {
        Object.assign(this, { exp, op });
    }
}

class ElementOf {
    constructor(object, id) {
        Object.assign(this, { object, id });
    }
}

class Selection {
    constructor(object, selection) {
        Object.assign(this, { object, selection });
    }
}

class Print {
    constructor(expression) {
        this.expression = expression;
    }
}

class Application {
    constructor(left, right) {
        Object.assign(this, { left, right });
    }
}

class Identifier {
    constructor(id) {
        this.id = id;
    }
}

module.exports = {
    Program,
    Assignment,
    Print,
    Application,
    Identifier,
};