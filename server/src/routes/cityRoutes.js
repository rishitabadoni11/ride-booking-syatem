const express = require("express");
const { suggestCities } = require("../controllers/cityController");

const router = express.Router();

router.get("/suggest", suggestCities);

module.exports = router;
