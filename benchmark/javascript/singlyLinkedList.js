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
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  prepend(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
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
    let cur = this.head;
    while (cur.next && cur.next.value !== value) {
      cur = cur.next;
    }
    if (cur.next) {
      if (cur.next === this.tail) {
        this.tail = cur;
      }
      cur.next = cur.next.next;
      this.length--;
      return true;
    }
    return false;
  }

  find(predicate) {
    let cur = this.head;
    while (cur) {
      if (predicate(cur.value)) {
        return cur.value;
      }
      cur = cur.next;
    }
    return undefined;
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
}
