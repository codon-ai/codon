export class MinBinaryHeap {
  constructor(compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.compare = compare;
    this.heap = [];
  }
  get size() { return this.heap.length; }
  peek() { return this.heap[0]; }
  push(val) {
    this.heap.push(val);
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parent]) >= 0) break;
      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
      idx = parent;
    }
  }
  pop() {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      let idx = 0;
      const len = this.heap.length;
      while (true) {
        let left = 2 * idx + 1, right = 2 * idx + 2, smallest = idx;
        if (left < len && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
        if (right < len && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
        if (smallest === idx) break;
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      }
    }
    return min;
  }
}
