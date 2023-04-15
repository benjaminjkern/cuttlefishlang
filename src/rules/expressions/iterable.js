import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type, OPTIONAL, MULTI } from "../../parse/ruleUtils.js";

const discreteRangeIterator = ({
    start,
    step,
    end = null,
    includeEnd = false,
    includeStart = true,
}) => {
    let value = start - step * includeStart;
    return {
        hasNext: () => {
            if (end === null) return true;
            // Catch step being negative (If its negative its basically like doing value + step <= end)
            if ((value + step - end) * step >= 0) {
                if (value + step === end) return includeEnd;
                return false;
            }
            return true;
        },
        next: () => {
            value += step;
            return value;
        },
        restart: () => (value = start - step * includeStart),
    };
};

const makeListIterator = (list) => {
    if (!Array.isArray(list))
        throw "Tried making list out of something that is NOT a list";

    let index = 0;
    const iterator = {
        next: () => {
            if (!iterator.hasNext())
                throw "Tried calling iterator.next() when it do not have a next!";
            index++;
            return list[index - 1];
        },
        hasNext: () => {
            return index < list.length;
        },
        restart: () => (index = 0),
    };
    return iterator;
};

export default {
    Iterable: [
        {
            pattern: [type("DiscreteRange")],
            evaluate: ({ tokens: [range] }) =>
                discreteRangeIterator(evaluateExpression(range)),
        },
        {
            pattern: [type("List")],
            evaluate: ({ tokens: [list] }) =>
                makeListIterator(evaluateExpression(list)),
        },
        {
            pattern: [type("Iterable"), "++", type("Iterable")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [a, _, b] }) => {
                // Combine the two iterators
                const iteratorA = evaluateExpression(a);
                const iteratorB = evaluateExpression(b);
                const returnIterator = {
                    usingIteratorA: iteratorA.hasNext(),
                    next: () => {
                        if (returnIterator.usingIteratorA) {
                            const next = iteratorA.next();
                            returnIterator.usingIteratorA = iteratorA.hasNext();
                            return next;
                        }
                        return iteratorB.next();
                    },
                    hasNext: () => {
                        if (returnIterator.usingIteratorA)
                            return iteratorA.hasNext();
                        return iteratorB.hasNext();
                    },
                    restart: () => {
                        iteratorA.restart();
                        iteratorB.restart();
                        returnIterator.usingIteratorA = iteratorA.hasNext();
                    },
                };
                return returnIterator;
            },
        },
    ],
    List: [
        {
            pattern: [type("List"), "++", type("List")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [a, _, b] }) => [
                // This will have issues when it comes to non-list iterables
                ...evaluateExpression(a),
                ...evaluateExpression(b),
            ],
        },
        { pattern: [type("listlit")] },
    ],
    listlit: [
        {
            pattern: ["[", OPTIONAL(type("commaSeparatedObjects")), "]"],
            evaluate: ({ tokens: [_, a] }) => evaluateExpression(a),
        },
    ],
    DiscreteRange: [
        {
            pattern: ["[", type("Number"), "..", "]"],
            evaluate: ({ tokens: [_, start] }) => ({
                start: evaluateExpression(start),
                step: 1,
            }),
        },
        {
            pattern: ["[", type("Number"), "..", type("Number"), "]"],
            evaluate: ({ tokens: [_1, start, _2, end] }) => ({
                start: evaluateExpression(start),
                step: 1,
                end: evaluateExpression(end),
            }),
        },
        {
            pattern: ["[", type("Number"), "..", type("Number"), "..", "]"],
            evaluate: ({ tokens: [_1, start, _2, step] }) => ({
                start: evaluateExpression(start),
                step: evaluateExpression(step),
            }),
        },
        {
            pattern: [
                "[",
                type("Number"),
                "..",
                type("Number"),
                "..",
                type("Number"),
                "]",
            ],
            evaluate: ({ tokens: [_1, start, _2, step, _3, end] }) => ({
                start: evaluateExpression(start),
                step: evaluateExpression(step),
                end: evaluateExpression(end),
            }),
        },
    ],
    commaSeparatedObjects: [
        {
            pattern: [
                type("Object"),
                MULTI([",", MULTI(type("space")), type("Object")]),
                OPTIONAL(","),
            ],
            evaluate: ({ tokens: [head, [commas, spaces, rest]] }) => {
                return [
                    evaluateExpression(head),
                    ...rest.map(evaluateExpression),
                ];
            },
        },
    ],
};
