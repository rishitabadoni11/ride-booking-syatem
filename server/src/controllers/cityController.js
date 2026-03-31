const Trie = require("../algorithms/trie");
const { cities } = require("../data/cities");

const cityTrie = new Trie(cities.map((city) => city.name));

const suggestCities = async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.json({ suggestions: [] });
  }

  const suggestions = cityTrie.suggest(query, 10);
  return res.json({ suggestions });
};

module.exports = { suggestCities };
