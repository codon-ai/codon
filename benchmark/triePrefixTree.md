# Trie Prefix Tree
Create a Trie (Prefix Tree) data structure for efficient string lookup in a single file.

Requirements:
- Class `TrieNode`: property `children: Map<string, TrieNode> = new Map()`, property `isEndOfWord: boolean = false`.
- Export class `Trie`: root node initialized to `new TrieNode()`.
- Method `insert(word: string): void`: walks or creates child nodes for each character; marks final node `isEndOfWord = true`.
- Method `search(word: string): boolean`: traverses matching characters; returns `true` if final node exists and `isEndOfWord === true`, else `false`.
- Method `startsWith(prefix: string): boolean`: traverses matching characters; returns `true` if all prefix nodes exist, else `false`.
- At bottom: insert `"apple"`, `"app"`, assert `search("apple") === true`, `search("app") === true`, `search("appl") === false`, `startsWith("appl") === true`.
