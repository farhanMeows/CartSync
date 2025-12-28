require("dotenv").config();
const { sequelize } = require("../src/config/database");
const Cart = require("../src/models/Cart");

async function seed() {
  await sequelize.authenticate();
  console.log("✅ DB connected");

  const carts = [
    { cartId: "cart001", password: "qwerty", name: "Simulation Cart 1" },
    { cartId: "cart002", password: "qwerty", name: "Simulation Cart 2" },
  ];

  for (const cart of carts) {
    const exists = await Cart.findOne({ where: { cartId: cart.cartId } });
    if (exists) continue;

    await Cart.create(cart); // bcrypt hook runs
    console.log(`🆕 Created ${cart.cartId}`);
  }

  process.exit(0);
}

seed();
