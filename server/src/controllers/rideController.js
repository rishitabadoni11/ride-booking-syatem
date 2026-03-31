const Ride = require("../models/Ride");
const User = require("../models/User");
const dijkstraShortestDistance = require("../algorithms/dijkstra");
const cityGraph = require("../data/cityGraph");
const { cityMap } = require("../data/cities");
const { haversineDistanceKm } = require("../utils/geo");
const { onlineDrivers, userSocketMap, driverSocketMap } = require("../services/state");

// Fare calculation: per km rate + base fare
const FARE_CONFIG = {
  basefare: 50, // INR
  perKmRate: 12, // INR per km
  surgeFactor: 1.0, // Can be increased during peak times
};

const calculateFare = (distanceKm) => {
  const distanceCharge = Math.round(distanceKm * FARE_CONFIG.perKmRate);
  const fare = FARE_CONFIG.basefare + distanceCharge;
  const platformFee = Math.round(fare * 0.08); // 8% platform fee
  const totalFare = fare + platformFee;
  return {
    baseFare: FARE_CONFIG.basefare,
    distanceCharge,
    platformFee,
    totalFare: Math.round(totalFare),
    distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimals
  };
};

// Normalize city names: trim and ensure proper capitalization
const normalizeCityName = (cityName) => {
  if (!cityName) return null;
  // Find exact match in cityMap (case-insensitive)
  const normalized = Object.keys(cityMap).find(
    (key) => key.toLowerCase() === cityName.trim().toLowerCase()
  );
  return normalized || null;
};

const getRouteDistance = (pickupCity, dropCity) => {
  // Normalize city names to match graph keys
  const normalizedPickup = normalizeCityName(pickupCity);
  const normalizedDrop = normalizeCityName(dropCity);

  if (!normalizedPickup || !normalizedDrop) {
    return Number.POSITIVE_INFINITY;
  }

  const roadDistance = dijkstraShortestDistance(cityGraph, normalizedPickup, normalizedDrop);

  if (roadDistance !== Number.POSITIVE_INFINITY) {
    return roadDistance;
  }

  const pickup = cityMap[normalizedPickup];
  const drop = cityMap[normalizedDrop];

  if (!pickup || !drop) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round(haversineDistanceKm(pickup, drop));
};

const findNearestDriver = async (pickupCity) => {
  const normalizedCity = normalizeCityName(pickupCity);
  if (!normalizedCity) {
    return null;
  }

  const pickup = cityMap[normalizedCity];
  if (!pickup) {
    return null;
  }

  const onlineDriverEntries = Array.from(onlineDrivers.values());
  if (!onlineDriverEntries.length) {
    return null;
  }

  let nearest = null;

  // Optimized: Don't query DB for each driver, use cached data from state
  for (const entry of onlineDriverEntries) {
    const distance = haversineDistanceKm(
      { lat: entry.lat, lng: entry.lng },
      { lat: pickup.lat, lng: pickup.lng }
    );

    if (!nearest || distance < nearest.distance) {
      nearest = {
        driverId: entry.driverId,
        name: entry.name || "Driver",
        city: entry.city,
        distance,
      };
    }
  }

  return nearest;
};

const bookRide = async (req, res) => {
  try {
    console.log("[RIDE] 📍 Booking request received:", req.body);
    console.log("[RIDE] 👤 User ID:", req.user?._id);
    console.log("[RIDE] 🚗 Online drivers count:", onlineDrivers.size);
    
    let { pickupCity, dropCity } = req.body;

    if (!pickupCity || !dropCity) {
      console.log("[RIDE] ❌ Missing cities:", { pickupCity, dropCity });
      return res.status(400).json({ message: "pickupCity and dropCity are required" });
    }

    // Normalize city names
    console.log("[RIDE] 🔍 Normalizing cities...");
    const originalPickup = pickupCity;
    const originalDrop = dropCity;
    
    pickupCity = normalizeCityName(pickupCity);
    dropCity = normalizeCityName(dropCity);

    console.log("[RIDE] ✅ Normalized:", { original: { pickup: originalPickup, drop: originalDrop }, normalized: { pickupCity, dropCity } });

    if (!pickupCity || !dropCity) {
      console.log("[RIDE] ❌ Invalid normalized cities. Available:", Object.keys(require("../data/cities").cityMap));
      return res.status(400).json({ message: "Invalid city names. Please select from available cities." });
    }

    console.log("[RIDE] 🗺️  Calculating shortest distance...");
    const shortestDistanceKm = getRouteDistance(pickupCity, dropCity);
    console.log("[RIDE] 📊 Shortest distance:", shortestDistanceKm, "km");

    if (shortestDistanceKm === Number.POSITIVE_INFINITY) {
      console.log("[RIDE] ❌ Route not found between", pickupCity, "and", dropCity);
      return res.status(400).json({ message: "Unable to compute route for selected cities" });
    }

    // Calculate fare based on shortest distance
    console.log("[RIDE] 💰 Calculating fare for", shortestDistanceKm, "km");
    const fareEstimate = calculateFare(shortestDistanceKm);
    console.log("[RIDE] 💰 Fare calculated:", fareEstimate);

    console.log("[RIDE] 🔍 Finding nearest driver in:", pickupCity);
    const nearestDriver = await findNearestDriver(pickupCity);
    console.log("[RIDE] 🚗 Nearest driver found:", nearestDriver);

    console.log("[RIDE] 💾 Creating ride in database...");
    const ride = await Ride.create({
      userId: req.user._id,
      driverId: nearestDriver?.driverId || null,
      pickupCity,
      dropCity,
      shortestDistanceKm,
      distanceFromDriverToPickupKm: nearestDriver ? Number(nearestDriver.distance.toFixed(2)) : 0,
      status: nearestDriver ? "assigned" : "searching",
      fareEstimate: fareEstimate.totalFare,
    });

    console.log("[RIDE] ✅ Ride created:", ride._id);

    if (nearestDriver?.driverId) {
      const driverSocketId = driverSocketMap.get(String(nearestDriver.driverId));
      if (driverSocketId) {
        req.io.to(driverSocketId).emit("ride:assigned", {
          rideId: ride._id,
          pickupCity,
          dropCity,
          shortestDistanceKm,
          userId: req.user._id,
        });
        console.log("[RIDE] 📢 Ride assigned event sent to driver");
      }
    }

    const response = {
      ride,
      fareEstimate,
      nearestDriver: nearestDriver
        ? {
            driverId: nearestDriver.driverId,
            name: nearestDriver.name,
            city: nearestDriver.city,
            distanceFromDriverToPickupKm: Number(nearestDriver.distance.toFixed(2)),
          }
        : null,
    };

    console.log("[RIDE] 🎉 Sending response:", response);
    return res.status(201).json(response);
  } catch (error) {
    console.error("[RIDE] 🔥 Error in bookRide:", error.message);
    console.error("[RIDE] 🔥 Stack trace:", error.stack);
    return res.status(500).json({ message: "Failed to book ride", error: error.message });
  }
};

const getMyLatestRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

    if (!ride) {
      return res.json({ ride: null });
    }

    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ride", error: error.message });
  }
};

const updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    if (!["ongoing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid ride status" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (String(ride.driverId) !== String(req.user._id)) {
      return res.status(403).json({ message: "This ride is not assigned to you" });
    }

    ride.status = status;
    await ride.save();

    const userSocketId = userSocketMap.get(String(ride.userId));
    if (userSocketId) {
      req.io.to(userSocketId).emit("ride:status", {
        rideId: ride._id,
        status: ride.status,
      });
    }

    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ride status", error: error.message });
  }
};

module.exports = {
  bookRide,
  getMyLatestRide,
  updateRideStatus,
};
