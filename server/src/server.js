require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const rideRoutes = require("./routes/rideRoutes");
const driverRoutes = require("./routes/driverRoutes");
const myRidesRoutes = require("./routes/myRidesRoutes");
const { userSocketMap, driverSocketMap, onlineDrivers } = require("./services/state");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Ride booking API is live" });
});

// DEBUG ENDPOINT - Remove in production
app.get("/api/debug", (req, res) => {
  console.log("[DEBUG] Status check requested");
  const { onlineDrivers, userSocketMap, driverSocketMap } = require("./services/state");
  
  res.json({
    message: "Debug info",
    timestamp: new Date().toISOString(),
    onlineDriversCount: onlineDrivers.size,
    onlineDrivers: Array.from(onlineDrivers.values()),
    userSocketsCount: userSocketMap.size,
    driverSocketsCount: driverSocketMap.size,
    dbConnection: "checking...",
  });
});

// DEBUG: Test Dijkstra
app.get("/api/debug/dijkstra", (req, res) => {
  const dijkstra = require("./algorithms/dijkstra");
  const cityGraph = require("./data/cityGraph");
  const { cityMap } = require("./data/cities");
  
  const from = req.query.from || "Bengaluru";
  const to = req.query.to || "Chennai";
  
  console.log(`[DEBUG] Testing Dijkstra: ${from} -> ${to}`);
  
  const distance = dijkstra(cityGraph, from, to);
  
  res.json({
    from,
    to,
    distance,
    available_cities: Object.keys(cityMap),
    graph_nodes: Object.keys(cityGraph),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/my-rides", myRidesRoutes);

io.on("connection", (socket) => {
  socket.on("register:user", ({ userId }) => {
    if (userId) {
      userSocketMap.set(String(userId), socket.id);
    }
  });

  socket.on("register:driver", ({ driverId }) => {
    if (driverId) {
      driverSocketMap.set(String(driverId), socket.id);
    }
  });

  socket.on("driver:location:update", ({ driverId, city, lat, lng }) => {
    if (driverId && typeof lat === "number" && typeof lng === "number") {
      onlineDrivers.set(String(driverId), {
        driverId: String(driverId),
        city,
        lat,
        lng,
        updatedAt: Date.now(),
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
      }
    }

    for (const [driverId, socketId] of driverSocketMap.entries()) {
      if (socketId === socket.id) {
        driverSocketMap.delete(driverId);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize dummy drivers in onlineDrivers for demo purposes
    console.log("[INIT] 🚗 Initializing dummy drivers...");
    const User = require("./models/User");
    
    // Fetch actual driver records from database
    const driverEmails = [
      "driver1@ridebooking.com",
      "driver2@ridebooking.com", 
      "driver3@ridebooking.com",
      "driver4@ridebooking.com",
      "driver5@ridebooking.com",
      "driver6@ridebooking.com",
      "driver7@ridebooking.com",
      "driver8@ridebooking.com",
      "driver9@ridebooking.com",
      "driver10@ridebooking.com",
    ];

    const driverLocationData = [
      { email: "driver1@ridebooking.com", name: "Rajesh Kumar", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
      { email: "driver2@ridebooking.com", name: "Priya Singh", city: "Bengaluru", lat: 12.9750, lng: 77.5900 },
      { email: "driver3@ridebooking.com", name: "Amit Patel", city: "Chennai", lat: 13.0827, lng: 80.2707 },
      { email: "driver4@ridebooking.com", name: "Neha Verma", city: "Chennai", lat: 13.0900, lng: 80.2750 },
      { email: "driver5@ridebooking.com", name: "Vikram Menon", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
      { email: "driver6@ridebooking.com", name: "Sneha Reddy", city: "Hyderabad", lat: 17.3850, lng: 78.4867 },
      { email: "driver7@ridebooking.com", name: "Arjun Kapoor", city: "Delhi", lat: 28.7041, lng: 77.1025 },
      { email: "driver8@ridebooking.com", name: "Zara Khan", city: "Delhi", lat: 28.7100, lng: 77.1100 },
      { email: "driver9@ridebooking.com", name: "Rohan Sharma", city: "Pune", lat: 18.5204, lng: 73.8567 },
      { email: "driver10@ridebooking.com", name: "Anjali Gupta", city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    ];
    
    for (const driverData of driverLocationData) {
      const driver = await User.findOne({ email: driverData.email });
      if (driver) {
        onlineDrivers.set(String(driver._id), {
          driverId: String(driver._id),
          name: driver.name,
          city: driverData.city,
          lat: driverData.lat,
          lng: driverData.lng,
          updatedAt: Date.now(),
        });
      }
    }
    
    console.log(`[INIT] ✅ ${onlineDrivers.size} dummy drivers initialized`);
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`[INIT] 🌍 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
      console.log(`[INIT] 📡 MongoDB connected to: ${process.env.MONGO_URI?.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
