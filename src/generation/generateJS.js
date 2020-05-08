const makeAST = require("../ast/make_AST");
const { inspect } = require("util");

const generateJS = (input) => {
    return generateNode(makeAST(input));
};
const generateNode = (node, args) => {
    console.log(node);
    return generateNodeMap[node.type](node.fields, args);
};

const generateNodeMap = {
        Specification({ body }) {
            return body
                .map((statement) => generateNode(statement, { process: false }))
                .join("\n");
        },
        PrintStatement({ exp }) {
            return `console.log(${generateNode(exp)});`;
        },
        PutStatement({ exp }, { process }) {
            return `${process ? "yield" : "return"} ${generateNode(exp)};`;
        },
        AssignmentStatement({ id, exp }) {
            return `const ${generateNode(id, { id: true })} = ${generateNode(exp)};`;
        },
        Pattern({ patternElems }, { id }) {
            if (!id) {
                return patternElems
                    .map((patternElem, idx) => generateNode(patternElem, { idx }))
                    .join("&&");
            }
            if (patternElems.length == 1) return patternElems[0].fields.id.fields.id;
            throw Error("Something went wrong!");
        },
        TuplePattern({ contents }) {
            return contents
                .map((bit, idx) => "(" + generateNode(bit, { idx }) + ")")
                .join("&&");
        },
        ListPattern: ["list_type", "head", "tail"],
        FunctionType: ["input_type", "output_type"],
        ListType: ["type"],
        AbstractType: ["id", "pattern_block"],
        Type({ id }) {
            return generateNode(id);
        },
        TypePattern({ type, id }) {
            if (type.length === 0) return "true";
            return `typeof ${generateNode(id)} === '${type
      .map((t) => generateNode(t))
      .join("")}'`;
        },
        AtomicPattern({ atom }, { index }) {
            return `arguments[${index}] === ${atom}`;
        },
        AnonymousSubRoutineGroup({ statement_block }, { process }) {
            return statement_block
                .map((statement) => generateNode(statement, { process }))
                .join("\n");
        },
        Function({ subroutine_block }) {
            const args = { process: false };
            return `function() {
${
  subroutine_block.type === "AnonymousSubRoutineGroup"
    ? generateNode(subroutine_block, args)
    : subroutine_block
        .map((subroutine) => generateNode(subroutine, args))
        .join(" else ")
}
}`;
        },
        Process({ subroutine_block }) {
            const args = { process: true };
            return `function*() {
${
  subroutine_block.type === "AnonymousSubRoutineGroup"
    ? generateNode(subroutine_block, args)
    : subroutine_block
        .map((subroutine) => generateNode(subroutine, args))
        .join(" else ")
}
}`;
        },
        Server({ subroutine_block }) {
            const args = { process: true };
            return `function*() {
${
  subroutine_block.type === "AnonymousSubRoutineGroup"
    ? generateNode(subroutine_block, args)
    : subroutine_block
        .map((subroutine) => generateNode(subroutine, args))
        .join(" else ")
}
}`;
        },
        Guard({ exp }) {
            return generateNode(exp);
        },
        Expression({ atoms }) {
            // to be fixed once expression parsing works
            const value = atoms[0];
            const args = atoms.slice(1);
            const isExp = value.type == "Expression";
            return (
                    `${isExp ? "(" : ""}${generateNode(value)}${isExp ? ")" : ""}` +
                    (args ? `${args.map((arg) => `(${generateNode(arg)})`).join("")}` : "")
    );
  },
  Select({ subject, predicate }) {
    // needs to be fixed
    return `${generateNode(subject)}`;
  },
  Tuple({ contents }) {
    return `[${contents.map((bit) => generateNode(bit)).join(",")}]`;
  },
  NumList({ start, step, end }) {
    // this doesnt actually match how Cuttlefish does it but i do not caare
    return `(function*()=>{
      let x = ${start};
      while (x < ${end ? end : Infinity}) {
        x += ${step ? step : 1};
        yield x;
      }
    })()`;
  },
  List({ contents }) {
    return `[${contents.map((bit) => generateNode(bit)).join(",")}]`;
  },
  Numlit({ num }) {
    return num;
  },
  SubRoutine({ pattern, guards, returnTypes, statements }, { process }) {
    return `if ((${generateNode(pattern, { id: false })}) && (${
      guards.length > 0
        ? guards.map((guard) => "(" + generateNode(guard) + ")").join("&&")
        : "true"
    })) {
${statements
  .map((statement) => generateNode(statement, { process }))
  .join("\n")}
}`;
  },
  Id({ id }) {
    return id;
  },
  Operator({ id }) {
    return id;
  },
  String({ contents }) {
    return `'${contents}'`;
  },
  InterpolatedString({ strings, expressions }) {
    return zip(strings, expressions);
  },
};

const zip = (...rows) => [...rows[0]].map((_, c) => rows.map((row) => row[c]));

module.exports = generateJS;