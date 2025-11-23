const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Cart = require("../models/Cart");
const LocationHistory = require("../models/LocationHistory");
const { authMiddleware } = require("../middleware/auth");

// Update location (Cart only)
router.post("/update", authMiddleware, async (req, res) => {
  try {
    // Only carts can update their location
    if (req.userType !== "cart") {
      return res.status(403).json({ error: "Only carts can update location" });
    }

    const { latitude, longitude, accuracy } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const cart = req.cart;

    // Log location update
    console.log(`📍 Location update from ${cart.cartId} (${cart.name}):`, {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      accuracy: accuracy ? accuracy.toFixed(2) + "m" : "N/A",
      time: new Date().toLocaleTimeString(),
    });

    // Update cart's last location and last seen (flattened fields for PostgreSQL)
    const timestamp = new Date();
    const wasOffline = !cart.isOnline;
    
    cart.lastLocationLatitude = latitude;
    cart.lastLocationLongitude = longitude;
    cart.lastLocationAccuracy = accuracy || null;
    cart.lastLocationTimestamp = timestamp;
    cart.lastSeen = new Date();
    cart.isOnline = true;

    await cart.save();

    // If cart just came online, emit status change
    if (wasOffline) {
      const io = req.app.get("io");
      if (io) {
        io.emit("cart-status-changed", {
          cartId: cart.cartId,
          name: cart.name,
          isOnline: true,
          lastSeen: cart.lastSeen,
        });
        console.log(`✅ ${cart.cartId} (${cart.name}) is now ACTIVE`);
      }
    }

    // Save to location history
    await LocationHistory.create({
      cartId: cart.cartId,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy || null,
    });

    // Emit to Socket.IO (handled by socket service)
    const io = req.app.get("io");
    if (io) {
      io.emit("location-update", {
        cartId: cart.cartId,
        name: cart.name,
        location: {
          latitude,
          longitude,
          accuracy,
        },
        timestamp: timestamp,
        isOnline: true,
      });
    }

    res.json({
      message: "Location updated successfully",
      location: {
        latitude: cart.lastLocationLatitude,
        longitude: cart.lastLocationLongitude,
        accuracy: cart.lastLocationAccuracy,
        timestamp: cart.lastLocationTimestamp,
      },
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get location history for a cart
router.get("/history/:cartId", authMiddleware, async (req, res) => {
  try {
    const { cartId } = req.params;
    const { limit = 100, startDate, endDate } = req.query;

    const where = { cartId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const history = await LocationHistory.findAll({
      where,
      order: [["timestamp", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(history);
  } catch (error) {
    console.error("Get location history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
