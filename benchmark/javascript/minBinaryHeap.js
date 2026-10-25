export class MinBinaryHeap {
  constructor(compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.heap = [];
    this.compare = compare;
  }

  push(val) {
    this.heap.push(val);
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
        const tmp = this.heap[idx];
        this.heap[idx] = this.heap[parentIdx];
        this.heap[parentIdx] = tmp;
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      let idx = 0;
      const len = this.heap.length;
      while (true) {
        let smallest = idx;
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        if (left < len && this.compare(this.heap[left], this.heap[smallest]) < 0) {
          smallest = left;
        }
        if (right < len && this.compare(this.heap[right], this.heap[smallest]) < 0) {
          smallest = right;
        }
        if (smallest !== idx) {
          const tmp = this.heap[idx];
          this.heap[idx] = this.heap[smallest];
          this.heap[smallest] = tmp;
          idx = smallest;
        } else {
          break;
        }
      }
    }
    return min;
  }

  peek() {
    return this.heap[0];
  }

  get size() {
    return this.heap.length;
  }
}
