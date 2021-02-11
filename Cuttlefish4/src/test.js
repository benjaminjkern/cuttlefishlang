const start = { value: 1 };
const step = { value: 1 };
const end = { value: Number.MAX_SAFE_INTEGER };
const node = { includeStart: false, includeEnd: true };

const iterator = {
    ObjectType: "Iterator",
    next() {
        if (!this.hasNext) {
            console.log("Does not have a next!");
            return;
        }
        if (!this.current) { // this might be able to be cleaned up
            this.current = start;
            if (!node.includeStart) this.current.value += step.value;
        } else this.current.value += step.value;
        this.hasNext = node.includeEnd ? (this.current.value + step.value) * step.value <= step.value * end.value : (this.current.value + step.value) * step.value < step.value * end.value;
        return { current: this.current, hasNext: this.hasNext };
    }
};
if (node.includeStart) iterator.hasNext = true;
else if ((end.value - start.value) * step.value < 0)
    iterator.hasNext = false;
else iterator.hasNext = node.includeEnd ? (start.value + step.value) * step.value <= step.value * end.value : (start.value + step.value) * step.value < step.value * end.value;


console.log(iterator);
while (iterator.hasNext) {
    console.log(iterator.next().current.value);
}