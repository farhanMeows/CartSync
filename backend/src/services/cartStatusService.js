const { Op } = require("sequelize");
const Cart = require("../models/Cart");

// Check for inactive carts every 30 seconds
const INACTIVITY_CHECK_INTERVAL = 30 * 1000; // 30 seconds
const INACTIVITY_THRESHOLD = 60 * 1000; // 1 minute

class CartStatusService {
  constructor(io) {
    this.io = io;
    this.intervalId = null;
  }

  start() {
    console.log("📊 Starting cart status monitor...");
    console.log(
      `   Checking every ${INACTIVITY_CHECK_INTERVAL / 1000} seconds`
    );
    console.log(
      `   Marking inactive after ${INACTIVITY_THRESHOLD / 1000} seconds without updates\n`
    );

    // Run immediately on start
    this.checkInactiveCarts();

    // Then run periodically
    this.intervalId = setInterval(() => {
      this.checkInactiveCarts();
    }, INACTIVITY_CHECK_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("📊 Cart status monitor stopped");
    }
  }

  async checkInactiveCarts() {
    try {
      const now = new Date();
      const inactivityTime = new Date(now.getTime() - INACTIVITY_THRESHOLD);

      // Find carts that are marked as online but haven't sent updates in the last 1 minute
      const inactiveCarts = await Cart.findAll({
        where: {
          isOnline: true,
          lastSeen: {
            [Op.lt]: inactivityTime,
          },
        },
      });

      if (inactiveCarts.length > 0) {
        console.log(
          `⚠️  Found ${inactiveCarts.length} inactive cart(s):`,
          inactiveCarts.map((cart) => cart.cartId).join(", ")
        );

        // Mark them as offline
        for (const cart of inactiveCarts) {
          cart.isOnline = false;
          await cart.save();

          // Emit to Socket.IO
          if (this.io) {
            this.io.emit("cart-status-changed", {
              cartId: cart.cartId,
              name: cart.name,
              isOnline: false,
              lastSeen: cart.lastSeen,
            });
          }

          console.log(
            `   ❌ ${cart.cartId} (${cart.name}) marked as inactive - Last seen: ${cart.lastSeen.toLocaleTimeString()}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Error checking inactive carts:", error.message);
    }
  }
}

module.exports = CartStatusService;
