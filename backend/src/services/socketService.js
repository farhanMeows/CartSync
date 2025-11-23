const Cart = require("../models/Cart");

const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Admin connects
    socket.on("admin-connect", () => {
      socket.join("admins");
      console.log("Admin connected");
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Request all carts status
    socket.on("get-all-carts", async () => {
      try {
        const carts = await Cart.findAll({
          attributes: { exclude: ["password"] },
        });
        socket.emit("all-carts", carts);
      } catch (error) {
        console.error("Get all carts error:", error);
        socket.emit("error", { message: "Failed to fetch carts" });
      }
    });
  });
};

module.exports = setupSocketIO;
