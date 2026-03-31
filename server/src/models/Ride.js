const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pickupCity: {
      type: String,
      required: true,
    },
    dropCity: {
      type: String,
      required: true,
    },
    shortestDistanceKm: {
      type: Number,
      required: true,
    },
    distanceFromDriverToPickupKm: {
      type: Number,
      default: 0,
    },
    fareEstimate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["searching", "assigned", "ongoing", "completed", "cancelled"],
      default: "searching",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
