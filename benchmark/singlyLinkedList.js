class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
export class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  append(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }
  prepend(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.length++;
  }
  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.length--;
      return true;
    }
    let curr = this.head;
    while (curr.next && curr.next.value !== value) curr = curr.next;
    if (curr.next) {
      if (curr.next === this.tail) this.tail = curr;
      curr.next = curr.next.next;
      this.length--;
      return true;
    }
    return false;
  }
  find(predicate) {
    let curr = this.head;
    while (curr) {
      if (predicate(curr.value)) return curr.value;
      curr = curr.next;
    }
    return undefined;
  }
  toArray() {
    const res = [];
    let curr = this.head;
    while (curr) {
      res.push(curr.value);
      curr = curr.next;
    }
    return res;
  }
}
