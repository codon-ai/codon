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
    const node = new TreeNode(value);
    if (!this.root) { this.root = node; return; }
    let curr = this.root;
    while (true) {
      if (this.compare(value, curr.value) < 0) {
        if (!curr.left) { curr.left = node; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = node; return; }
        curr = curr.right;
      }
    }
  }
  contains(value) {
    let curr = this.root;
    while (curr) {
      const cmp = this.compare(value, curr.value);
      if (cmp === 0) return true;
      curr = cmp < 0 ? curr.left : curr.right;
    }
    return false;
  }
  inOrder() {
    const res = [];
    const traverse = node => {
      if (!node) return;
      traverse(node.left);
      res.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return res;
  }
  min() {
    if (!this.root) return undefined;
    let curr = this.root;
    while (curr.left) curr = curr.left;
    return curr.value;
  }
  max() {
    if (!this.root) return undefined;
    let curr = this.root;
    while (curr.right) curr = curr.right;
    return curr.value;
  }
}
