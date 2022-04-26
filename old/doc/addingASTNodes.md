# How To Add an AST Node Type To The Language
1. Add associated grammar entries to cuttlefish.ohm
2. Add AST Operations to the default AST Operations Object.
   - These should use node() to create an AST node object
3. Add the AST Node Specification to the default AST Object
   - These specify what arguments the node's constructor take
   - Consider whether you actually need a new AST node type, or whether you could better represent this by incorporating it into an existing AST node type.
4. Add any methods or default value fields that the AST node requires to the default Methods Object
   - If the object is terminal, then specify that with the terminal field.
