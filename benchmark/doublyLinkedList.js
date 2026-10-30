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
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }
  unshift(value) {
    const node = new DoublyNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.size++;
  }
  pop() {
    if (!this.tail) return undefined;
    const val = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.size--;
    return val;
  }
  shift() {
    if (!this.head) return undefined;
    const val = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.size--;
    return val;
  }
  toArray() {
    const res = [];
    let curr = this.head;
    while (curr) { res.push(curr.value); curr = curr.next; }
    return res;
  }
  toArrayReverse() {
    const res = [];
    let curr = this.tail;
    while (curr) { res.push(curr.value); curr = curr.prev; }
    return res;
  }
}
