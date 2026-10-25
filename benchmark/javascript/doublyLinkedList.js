class DoublyNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  push(value) {
    const node = new DoublyNode(value);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.size++;
  }

  unshift(value) {
    const node = new DoublyNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.size++;
  }

  pop() {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    this.size--;
    return value;
  }

  shift() {
    if (!this.head) return undefined;
    const value = this.head.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }
    this.size--;
    return value;
  }

  toArray() {
    const res = [];
    let cur = this.head;
    while (cur) {
      res.push(cur.value);
      cur = cur.next;
    }
    return res;
  }

  toArrayReverse() {
    const res = [];
    let cur = this.tail;
    while (cur) {
      res.push(cur.value);
      cur = cur.prev;
    }
    return res;
  }
}
