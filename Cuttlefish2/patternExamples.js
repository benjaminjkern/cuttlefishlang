const ALL_PATTERNS = [];

const makePattern = (name, match, returnType, func) => ALL_PATTERNS.push({ returnType, func, match, name })

makePattern("Assignment", "(ID var) '=' (Object obj)", "Process", (args, context) => context[args.var.value] = args.obj.value);
makePattern("Encapsulation", "'(' (Object a) ')'", "Object", (args, context) => args.a.value);
makePattern("Instantiation", "(Type t) ':' ListOf<Subroutine, ';'>")