const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected successfully");

    // Import models to ensure they're registered
    const Admin = require("../models/Admin");
    const Cart = require("../models/Cart");
    const LocationHistory = require("../models/LocationHistory");

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Database synced");

    // Create default admin if not exists (username is always 'admin')
    const adminExists = await Admin.findOne({
      where: { username: "admin" },
    });

    if (!adminExists) {
      await Admin.create({
        username: "admin",
        password: process.env.ADMIN_PASSWORD || "admin123",
      });
      console.log("✅ Default admin user created (username: admin)");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
