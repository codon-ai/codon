class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let cur = this.root;
    for (const char of word) {
      if (!cur.children.has(char)) {
        cur.children.set(char, new TrieNode());
      }
      cur = cur.children.get(char);
    }
    cur.isEndOfWord = true;
  }

  search(word) {
    let cur = this.root;
    for (const char of word) {
      if (!cur.children.has(char)) {
        return false;
      }
      cur = cur.children.get(char);
    }
    return cur !== undefined && cur.isEndOfWord === true;
  }

  startsWith(prefix) {
    let cur = this.root;
    for (const char of prefix) {
      if (!cur.children.has(char)) {
        return false;
      }
      cur = cur.children.get(char);
    }
    return cur !== undefined;
  }
}

const trie = new Trie();
trie.insert("apple");
trie.insert("app");
