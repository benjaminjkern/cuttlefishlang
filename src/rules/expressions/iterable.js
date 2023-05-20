import {
    type,
    OPTIONAL,
    MULTI,
    thisType,
    thisSubtype,
} from "../../parse/ruleUtils.js";
import { consoleWarn } from "../../util/environment.js";
import {
    concatenateIterators,
    discreteRangeIterator,
    makeListIterator,
} from "../../util/iterators.js";
import { union } from "../../util/sets.js";

const iterableDefaultSubtypes = ["Object"];

export default {
    Iterable: [
        {
            pattern: [type("DiscreteRange")],
            //     // TODO: Make this able to say when its just integers
            allowedSubtypes: ["Number"],
            evaluate: ({ tokens: [range], context }) =>
                discreteRangeIterator(context.evaluateExpression(range)),
        },
        {
            pattern: [type("List", thisSubtype(0))],
            evaluate: ({ tokens: [list], context }) =>
                makeListIterator(context.evaluateExpression(list)),
        },
        {
            pattern: [
                type("Iterable", thisSubtype(0)),
                "++",
                type("Iterable", thisSubtype(0)),
            ],
            evaluate: ({ tokens: [a, _, b], context }) => {
                return concatenateIterators(
                    context.evaluateExpression(a).clone(),
                    context.evaluateExpression(b).clone()
                );
            },
        },
        {
            pattern: [type("Iterable", thisSubtype(0)), "**", type("Integer")],
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
            pattern: [
                type("List", thisSubtype(0)),
                "++",
                type("List", thisSubtype(0)),
            ],
            evaluate: ({ tokens: [a, _, b], context }) => [
                ...context.evaluateExpression(a),
                ...context.evaluateExpression(b),
            ],
        },
        {
            pattern: [type("List", thisSubtype(0)), "**", type("Integer")],
            evaluate: ({ tokens: [list, _, n], context }) => {
                let num = context.evaluateExpression(n);
                if (num <= 0) return [];
                const inputList = context.evaluateExpression(list);
                const outputList = [...inputList];
                while (--num > 0) outputList.push(...inputList);
                return outputList;
            },
        },
        {
            pattern: [type("listlit", thisSubtype(0))],
        },
    ],
    listlit: [
        {
            pattern: [
                "[",
                OPTIONAL(type("commaSeparatedObjects", thisSubtype(0))),
                "]",
            ],
            evaluate: ({ tokens: [_, a], context }) => {
                if (a.length === 0) return [];
                return context.evaluateExpression(a);
            },
        },
    ],
    commaSeparatedObjects: [
        {
            pattern: [
                thisSubtype(0),
                MULTI([
                    ",",
                    MULTI(type("space")),
                    thisSubtype(0),
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
