import { type, OPTIONAL, MULTI } from "../../parse/ruleUtils.js";
import { consoleWarn } from "../../util/environment.js";

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
            const returnValue = start + step * !includeStart + step * index;
            if (end !== null && (returnValue - end) * step >= 0) {
                if (returnValue === end && includeEnd) return returnValue;
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
            evaluate: ({ tokens: [range], context }) =>
                discreteRangeIterator(context.evaluateExpression(range)),
        },
        {
            pattern: [type("List")],
            evaluate: ({ tokens: [list], context }) =>
                makeListIterator(context.evaluateExpression(list)),
        },
        {
            pattern: [type("Iterable"), "++", type("Iterable")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [a, _, b], context }) => {
                return concatenateIterators(
                    context.evaluateExpression(a).clone(),
                    context.evaluateExpression(b).clone()
                );
            },
        },
        {
            pattern: [type("Iterable"), "**", type("Integer")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [iter, _, n], context }) => {
                let num = context.evaluateExpression(n);
                if (num <= 0) return makeListIterator([]);
                const inputIterator = context.evaluateExpression(iter);
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
            evaluate: ({ tokens: [a, _, b], context }) => [
                // This will have issues when it comes to non-list iterables
                ...context.evaluateExpression(a),
                ...context.evaluateExpression(b),
            ],
        },
        {
            pattern: [type("List"), "**", type("Integer")],
            // TODO: Need output types to be a union of the two input types
            evaluate: ({ tokens: [list, _, n], context }) => {
                let num = context.evaluateExpression(n);
                if (num <= 0) return [];
                const inputList = context.evaluateExpression(list);
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
            evaluate: ({ tokens: [_, a], context }) => {
                if (a.length === 0) return [];
                return context.evaluateExpression(a);
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
            evaluate: ({ tokens: [head, [commas, spaces, rest]], context }) => {
                return [
                    context.evaluateExpression(head),
                    ...(rest ? rest.map(context.evaluateExpression) : []),
                ];
            },
        },
    ],
    DiscreteRange: [
        {
            pattern: ["[", type("Number"), "..", "]"],
            evaluate: ({ tokens: [_, start], context }) => ({
                start: context.evaluateExpression(start),
                step: 1,
            }),
        },
        {
            pattern: ["[", type("Number"), "..", type("Number"), "]"],
            evaluate: ({ tokens: [_1, start, _2, end], context }) => ({
                start: context.evaluateExpression(start),
                step: 1,
                end: context.evaluateExpression(end),
            }),
        },
        {
            pattern: ["[", type("Number"), "..", type("Number"), "..", "]"],
            evaluate: ({ tokens: [_1, start, _2, step], context }) => ({
                start: context.evaluateExpression(start),
                step: context.evaluateExpression(step),
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
            evaluate: ({
                tokens: [_1, start, _2, step, _3, end],
                context,
            }) => ({
                start: context.evaluateExpression(start),
                step: context.evaluateExpression(step),
                end: context.evaluateExpression(end),
            }),
        },
    ],
};
