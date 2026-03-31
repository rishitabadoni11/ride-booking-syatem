const Ride = require("../models/Ride");

// Get all rides for current user
const getMyRides = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("[MY RIDES] Fetching rides for user:", userId);

    const rides = await Ride.find({ userId })
      .populate("driverId", "name email phone rating vehicleNumber")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[MY RIDES] Found ${rides.length} rides`);

    // Format rides for frontend
    const formattedRides = rides.map((ride) => ({
      id: ride._id,
      pickupCity: ride.pickupCity,
      dropCity: ride.dropCity,
      distance: ride.shortestDistanceKm,
      fare: ride.fareEstimate,
      status: ride.status,
      driver: ride.driverId
        ? {
            id: ride.driverId._id,
            name: ride.driverId.name,
            phone: ride.driverId.phone,
            rating: ride.driverId.rating || 4.8,
            vehicleNumber: ride.driverId.vehicleNumber,
          }
        : null,
      driverDistance: ride.distanceFromDriverToPickupKm,
      bookedAt: ride.createdAt,
      completedAt: ride.updatedAt,
    }));

    res.json({
      success: true,
      rides: formattedRides,
      total: formattedRides.length,
      ongoing: formattedRides.filter((r) => r.status === "ongoing").length,
      completed: formattedRides.filter((r) => r.status === "completed").length,
    });
  } catch (error) {
    console.error("[MY RIDES] Error fetching rides:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch rides",
      message: error.message,
    });
  }
};

// Get ride details by ID
const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    console.log("[MY RIDES] Fetching ride details:", rideId);

    const ride = await Ride.findOne({ _id: rideId, userId })
      .populate("driverId", "name email phone rating vehicleNumber")
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: "Ride not found",
      });
    }

    const rideDetails = {
      id: ride._id,
      pickupCity: ride.pickupCity,
      dropCity: ride.dropCity,
      distance: ride.shortestDistanceKm,
      fare: ride.fareEstimate,
      status: ride.status,
      driver: ride.driverId
        ? {
            id: ride.driverId._id,
            name: ride.driverId.name,
            phone: ride.driverId.phone,
            rating: ride.driverId.rating || 4.8,
            vehicleNumber: ride.driverId.vehicleNumber,
          }
        : null,
      driverDistance: ride.distanceFromDriverToPickupKm,
      bookedAt: ride.createdAt,
      completedAt: ride.updatedAt,
      fareBreakdown: {
        baseFare: 50,
        perKmCharge: ride.shortestDistanceKm * 12,
        platformFee: Math.round(ride.fareEstimate * 0.08),
      },
    };

    res.json({
      success: true,
      ride: rideDetails,
    });
  } catch (error) {
    console.error("[MY RIDES] Error fetching ride details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ride details",
      message: error.message,
    });
  }
};

module.exports = {
  getMyRides,
  getRideDetails,
};
