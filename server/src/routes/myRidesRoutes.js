const express = require("express");
const { getMyRides, getRideDetails } = require("../controllers/myRidesController");
const { auth, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, authorizeRole("user"), getMyRides);
router.get("/:rideId", auth, authorizeRole("user"), getRideDetails);

module.exports = router;
