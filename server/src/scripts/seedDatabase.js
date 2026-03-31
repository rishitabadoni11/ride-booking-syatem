require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Ride = require("../models/Ride");

// Connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Dummy cities with coordinates
const DUMMY_CITIES = [
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Nashik", lat: 19.9975, lng: 73.7898 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Noida", lat: 28.5355, lng: 77.391 },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", lat: 21.1702, lng: 72.8311 },
];

// Dummy drivers
const DUMMY_DRIVERS = [
  { name: "Rajesh Kumar", email: "driver1@ridebooking.com", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Priya Singh", email: "driver2@ridebooking.com", city: "Bengaluru", lat: 12.95, lng: 77.60 },
  { name: "Amit Patel", email: "driver3@ridebooking.com", city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Neha Verma", email: "driver4@ridebooking.com", city: "Chennai", lat: 13.08, lng: 80.27 },
  { name: "Vikram Menon", email: "driver5@ridebooking.com", city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Sneha Reddy", email: "driver6@ridebooking.com", city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Arjun Kapoor", email: "driver7@ridebooking.com", city: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Zara Khan", email: "driver8@ridebooking.com", city: "Delhi", lat: 28.61, lng: 77.21 },
  { name: "Rohan Sharma", email: "driver9@ridebooking.com", city: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Anjali Gupta", email: "driver10@ridebooking.com", city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

// Dummy users
const DUMMY_USERS = [
  { name: "Manish Jeena", email: "user1@ridebooking.com", city: "Bengaluru" },
  { name: "Prateek Singh", email: "user2@ridebooking.com", city: "Chennai" },
  { name: "Divya Sharma", email: "user3@ridebooking.com", city: "Mumbai" },
  { name: "Karan Patel", email: "user4@ridebooking.com", city: "Delhi" },
  { name: "Sneha Kapoor", email: "user5@ridebooking.com", city: "Hyderabad" },
];

const seedDatabase = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected!");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Ride.deleteMany({});

    // Seed drivers
    console.log("👨‍💼 Seeding drivers...");
    const drivers = await Promise.all(
      DUMMY_DRIVERS.map(async (driverData) => {
        const hashedPassword = await bcrypt.hash("Rider@123", 10);
        return User.create({
          name: driverData.name,
          email: driverData.email,
          password: hashedPassword,
          role: "driver",
          city: driverData.city,
          isOnline: true,
          location: {
            lat: driverData.lat,
            lng: driverData.lng,
            city: driverData.city,
            updatedAt: new Date(),
          },
        });
      })
    );
    console.log(`✅ Created ${drivers.length} dummy drivers`);
    console.log(`📍 Driver emails: ${DUMMY_DRIVERS.map((d) => d.email).join(", ")}`);

    // Seed users
    console.log("👤 Seeding users...");
    const users = await Promise.all(
      DUMMY_USERS.map(async (userData) => {
        const hashedPassword = await bcrypt.hash("User@123", 10);
        return User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: "user",
          city: userData.city,
          isOnline: false,
          location: {
            lat: 0,
            lng: 0,
            city: userData.city,
            updatedAt: new Date(),
          },
        });
      })
    );
    console.log(`✅ Created ${users.length} dummy users`);
    console.log(`📧 User emails: ${DUMMY_USERS.map((u) => u.email).join(", ")}`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("DRIVER LOGIN:");
    console.log(`  Email: ${DUMMY_DRIVERS[0].email}`);
    console.log("  Password: Rider@123");
    console.log("USER LOGIN:");
    console.log(`  Email: ${DUMMY_USERS[0].email}`);
    console.log("  Password: User@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.connection.close();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
