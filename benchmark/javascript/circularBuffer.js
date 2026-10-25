export class CircularBuffer {
  constructor(capacity) {
    if (capacity <= 0) {
      throw new Error("Capacity must be positive");
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  write(item) {
    if (this.isFull()) {
      return false;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  read() {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  isFull() {
    return this.count === this.capacity;
  }

  isEmpty() {
    return this.count === 0;
  }

  get size() {
    return this.count;
  }
}
