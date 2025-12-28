const axios = require("axios");

const API_URL = process.env.API_URL || "http://127.0.0.1:5001";

const CARTS = [
  {
    cartId: "cart001",
    password: "qwerty",
    name: "Simulation Cart 1",
  },
  {
    cartId: "cart002",
    password: "qwerty",
    name: "Simulation Cart 2",
  },
];

async function seedCarts() {
  console.log("🌱 Seeding carts...");

  for (const cart of CARTS) {
    try {
      await axios.post(`${API_URL}/api/carts`, cart);
      console.log(`🆕 Cart created: ${cart.cartId}`);
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 400) {
        console.log(`ℹ️ Cart already exists: ${cart.cartId}`);
      } else {
        throw err;
      }
    }
  }

  console.log("✅ Cart seeding completed");
}

module.exports = seedCarts;
