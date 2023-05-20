import { consoleWarn } from "./environment.js";

export const discreteRangeIterator = ({
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

export const makeListIterator = (list) => {
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

export const concatenateIterators = (iteratorA, iteratorB) => {
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
