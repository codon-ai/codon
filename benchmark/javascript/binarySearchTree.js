class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinarySearchTree {
  constructor(compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.root = null;
    this.compare = compare;
  }

  insert(value) {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let cur = this.root;
    while (true) {
      if (this.compare(value, cur.value) < 0) {
        if (!cur.left) {
          cur.left = newNode;
          return;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = newNode;
          return;
        }
        cur = cur.right;
      }
    }
  }

  contains(value) {
    let cur = this.root;
    while (cur) {
      const cmp = this.compare(value, cur.value);
      if (cmp === 0) return true;
      cur = cmp < 0 ? cur.left : cur.right;
    }
    return false;
  }

  inOrder() {
    const result = [];
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  min() {
    if (!this.root) return undefined;
    let cur = this.root;
    while (cur.left) cur = cur.left;
    return cur.value;
  }

  max() {
    if (!this.root) return undefined;
    let cur = this.root;
    while (cur.right) cur = cur.right;
    return cur.value;
  }
}
