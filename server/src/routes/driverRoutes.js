const express = require("express");
const { setOnlineStatus, updateLocation } = require("../controllers/driverController");
const { auth, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/online", auth, authorizeRole("driver"), setOnlineStatus);
router.patch("/location", auth, authorizeRole("driver"), updateLocation);

module.exports = router;
