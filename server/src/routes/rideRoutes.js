const express = require("express");
const { bookRide, getMyLatestRide, updateRideStatus } = require("../controllers/rideController");
const { auth, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/book", auth, authorizeRole("user"), bookRide);
router.get("/my-latest", auth, authorizeRole("user"), getMyLatestRide);
router.patch("/:rideId/status", auth, authorizeRole("driver"), updateRideStatus);

module.exports = router;
