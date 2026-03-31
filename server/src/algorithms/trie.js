class TrieNode {
  constructor() {
    this.children = {};
    this.word = null;
  }
}

class Trie {
  constructor(words = []) {
    this.root = new TrieNode();
    words.forEach((word) => this.insert(word));
  }

  insert(word) {
    let node = this.root;
    const normalized = word.toLowerCase();
    for (const char of normalized) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.word = word;
  }

  suggest(prefix, limit = 8) {
    const normalized = prefix.toLowerCase();
    let node = this.root;

    for (const char of normalized) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }

    const results = [];
    const stack = [node];

    while (stack.length && results.length < limit) {
      const current = stack.pop();
      if (current.word) {
        results.push(current.word);
      }

      const keys = Object.keys(current.children).sort().reverse();
      keys.forEach((key) => stack.push(current.children[key]));
    }

    return results;
  }
}

module.exports = Trie;
