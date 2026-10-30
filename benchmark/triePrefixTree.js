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
    let curr = this.root;
    for (const char of word) {
      if (!curr.children.has(char)) curr.children.set(char, new TrieNode());
      curr = curr.children.get(char);
    }
    curr.isEndOfWord = true;
  }
  search(word) {
    let curr = this.root;
    for (const char of word) {
      if (!curr.children.has(char)) return false;
      curr = curr.children.get(char);
    }
    return curr.isEndOfWord === true;
  }
  startsWith(prefix) {
    let curr = this.root;
    for (const char of prefix) {
      if (!curr.children.has(char)) return false;
      curr = curr.children.get(char);
    }
    return true;
  }
}
const trie = new Trie();
trie.insert("apple");
trie.insert("app");
console.log(trie.search("apple") === true && trie.search("app") === true && trie.search("appl") === false && trie.startsWith("appl") === true);
