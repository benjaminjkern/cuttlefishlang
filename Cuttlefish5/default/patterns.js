const PATTERNS = {};

const newPattern =
    (returnType) =>
    (
        pattern,
        verify = () => true,
        evaluate = () => {
            throw `Cannot evalute yet.`;
        }
    ) => {
        if (!PATTERNS[returnType]) PATTERNS[returnType] = [];
        PATTERNS[returnType].push({ pattern, verify, evaluate });
    };

module.exports = { PATTERNS, newPattern };
