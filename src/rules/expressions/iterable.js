import { evaluateExpression } from "../../evaluate/evaluate.js";
import { type, OPTIONAL, MULTI } from "../../parse/ruleUtils.js";
import { consoleWarn } from "../../util/environment.js";
import { CuttlefishError } from "../../util/index.js";

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
        clone: () =>
            discreteRangeIterator({
                start,
                step,
                end,
                includeEnd,
                includeStart,
            }),
        getIndex: (index) => {
            const returnValue = start - step * includeStart + step * index;
            if ((returnValue + step - end) * step >= 0) {
                if (returnValue + step === end && includeEnd)
                    return returnValue;
                return undefined;
            }
            return returnValue;
        },
        length: end === null ? null : Math.floor((end - start) / step), // Definitely wrong but good enough for now
        itemInIterator: (object) =>
            typeof object === "number" &&
            (object - start) % step === 0 &&
            (object - start) * step >= 0 &&
            (end === null ||
                (object - end) * step < 0 ||
                (object === end && includeEnd)),
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
        hasNext: () => index < list.length,
        restart: () => (index = 0),
        clone: () => makeListIterator(list),
        getIndex: (indexToGet) => list[indexToGet],
        length: list.length,
        itemInIterator: (object) => list.includes(object),
    };
    return iterator;
};

const concatenateIterators = (iteratorA, iteratorB) => {
    if (iteratorA.length === null)
        consoleWarn(
            "Warning: Concatenating a to an infinite iterable (The second iterable will never run)"
        );
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
            if (returnIterator.usingIteratorA) return iteratorA.hasNext();
            return iteratorB.hasNext();
        },
        restart: () => {
            iteratorA.restart();
            iteratorB.restart();
            returnIterator.usingIteratorA = iteratorA.hasNext();
        },
        clone: () => concatenateIterators(iteratorA.clone(), iteratorB.clone()),
        getIndex: (index) => {
            if (iteratorA.length === null || index < iteratorA.length)
                return iteratorA.getIndex(index);
            return iteratorB.getIndex(index - iteratorA.length);
        },
        itemInIterator: (object) =>
            iteratorA.itemInIterator(object) ||
            iteratorB.itemInIterator(object),
    };
    return returnIterator;
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
                return concatenateIterators(
                    evaluateExpression(a).clone(),
                    evaluateExpression(b).clone()
                );
            },
        },
        {
            pattern: [type("Iterable"), "**", type("Integer")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [iter, _, n] }) => {
                let num = evaluateExpression(n);
                if (num <= 0) return makeListIterator([]);
                const inputIterator = evaluateExpression(iter);
                let outputIterator = inputIterator.clone();
                while (--num > 0)
                    outputIterator = concatenateIterators(
                        outputIterator.clone(),
                        inputIterator.clone()
                    );
                return outputIterator;
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
        {
            pattern: [type("List"), "**", type("Integer")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [list, _, n] }) => {
                let num = evaluateExpression(n);
                if (num <= 0) return [];
                const inputList = evaluateExpression(list);
                const outputList = [...inputList];
                while (--num > 0) outputList.push(...inputList);
                return outputList;
            },
        },
        { pattern: [type("listlit")] },
    ],
    listlit: [
        {
            pattern: ["[", OPTIONAL(type("commaSeparatedObjects")), "]"],
            evaluate: ({ tokens: [_, a] }) => {
                if (a.length === 0) return [];
                return evaluateExpression(a);
            },
        },
    ],
    commaSeparatedObjects: [
        {
            pattern: [
                type("Object"),
                MULTI([
                    ",",
                    MULTI(type("space")),
                    type("Object"),
                    MULTI(type("space")),
                ]),
                OPTIONAL(","),
            ],
            evaluate: ({ tokens: [head, [commas, spaces, rest]] }) => {
                return [
                    evaluateExpression(head),
                    ...(rest ? rest.map(evaluateExpression) : []),
                ];
            },
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
};
