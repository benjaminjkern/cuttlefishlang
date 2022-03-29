const HEAP = {
    leadingPointer: 0,
    objects: {},
    freePointers: [],
};

// TODO: Deal with newObject of primitive types
const newObject = (params, type) => {
    if (typeof params != 'object') return { type, value: params };
    const pointer = HEAP.freePointers.length === 0 ? HEAP.leadingPointer++ : HEAP.freePointers.pop();
    const obj = {...params, type, pointer };
    HEAP.objects[pointer] = obj;
    return obj;
}

const deleteObject = (pointer) => {
    if (!HEAP[pointer]) return;
    delete HEAP.objects[pointer];
    HEAP.freePointers.push(pointer);
    while (HEAP.leadingPointer === HEAP.freePointers[HEAP.freePointers.length - 1] + 1) {
        HEAP.freePointers.pop();
        HEAP.leadingPointer--;
    }
}

// TODO: Make garbage collection async
const getObject = (pointer) => {
    if (HEAP.objects[pointer]) return HEAP.objects[pointer];
    deleteObject(pointer);
}

module.exports = { newObject, deleteObject, getObject };