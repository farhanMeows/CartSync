require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/database");
const setupSocketIO = require("./services/socketService");
const CartStatusService = require("./services/cartStatusService");
const { startSimulation } = require("./locationSimulationService");

// Import routes
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/carts");
const locationRoutes = require("./routes/location");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Connect to database and initialize services
const initializeServer = async () => {
  await connectDB();

  // Setup Socket.IO
  setupSocketIO(io);

  // Start cart status monitoring service (after DB is ready)
  const cartStatusService = new CartStatusService(io);
  cartStatusService.start();
  await startSimulation();
};

initializeServer().catch((error) => {
  console.error("Failed to initialize server:", error);
  process.exit(1);
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "CartSync Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/location", locationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Listen on all network interfaces
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 CartSync Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🌐 Accessible at: http://localhost:${PORT} and http://192.168.141.150:${PORT}`
  );
  console.log(`\nAPI Endpoints:`);
  console.log(`  - POST /api/auth/cart/login     - Cart login`);
  console.log(`  - POST /api/auth/admin/login    - Admin login`);
  console.log(`  - GET  /api/carts               - Get all carts (admin)`);
  console.log(`  - POST /api/carts               - Create cart (admin)`);
  console.log(`  - POST /api/location/update     - Update location (cart)`);
  console.log(
    `  - GET  /api/location/history/:cartId - Get location history\n`
  );
});

module.exports = { app, server, io };
