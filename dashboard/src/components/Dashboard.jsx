import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MapView from "./MapView";
import CartList from "./CartList";
import CartModal from "./CartModal";
import socketService from "../services/socket";
import { cartAPI } from "../services/api";

const Dashboard = () => {
  const [carts, setCarts] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCart, setEditingCart] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Load initial data
    loadCarts();

    // Connect to socket
    const socket = socketService.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socketService.getAllCarts();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("all-carts", (data) => {
      setCarts(data);
    });

    socket.on("location-update", (data) => {
      updateCartLocation(data);
    });

    socket.on("cart-status-changed", (data) => {
      updateCartStatus(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("all-carts");
      socket.off("location-update");
      socket.off("cart-status-changed");
    };
  }, [navigate]);

  const loadCarts = async () => {
    try {
      const response = await cartAPI.getAll();
      setCarts(response.data);
    } catch (error) {
      console.error("Load carts error:", error);
      toast.error("Failed to load carts");
    } finally {
      setLoading(false);
    }
  };

  const updateCartLocation = (data) => {
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.cartId === data.cartId
          ? {
              ...cart,
              lastLocation: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
                accuracy: data.location.accuracy,
                timestamp: data.timestamp,
              },
              lastSeen: data.timestamp,
              isOnline: data.isOnline,
            }
          : cart
      )
    );
  };

  const updateCartStatus = (data) => {
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.cartId === data.cartId
          ? {
              ...cart,
              isOnline: data.isOnline,
              lastSeen: data.lastSeen,
            }
          : cart
      )
    );
  };

  const handleCreateCart = () => {
    setEditingCart(null);
    setShowModal(true);
  };

  const handleEditCart = (cart) => {
    setEditingCart(cart);
    setShowModal(true);
  };

  const handleDeleteCart = async (cart) => {
    if (
      !window.confirm(
        `Are you sure you want to delete cart "${cart.name || cart.cartId}"?`
      )
    ) {
      return;
    }

    try {
      await cartAPI.delete(cart.cartId);
      toast.success("Cart deleted successfully");
      loadCarts();
      if (selectedCart?.cartId === cart.cartId) {
        setSelectedCart(null);
      }
    } catch (error) {
      console.error("Delete cart error:", error);
      toast.error(error.response?.data?.error || "Failed to delete cart");
    }
  };

  const handleSaveCart = async (formData) => {
    try {
      if (editingCart) {
        // Update existing cart
        const updateData = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await cartAPI.update(editingCart.cartId, updateData);
        toast.success("Cart updated successfully");
      } else {
        // Create new cart
        await cartAPI.create(formData);
        toast.success("Cart created successfully");
      }

      setShowModal(false);
      setEditingCart(null);
      loadCarts();
    } catch (error) {
      console.error("Save cart error:", error);
      toast.error(error.response?.data?.error || "Failed to save cart");
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CartSync</h2>
          <p>Real-time Cart Tracking</p>
          <div className="connection-status">
            <span
              className={`status-dot ${isConnected ? "" : "disconnected"}`}
            ></span>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="sidebar-content">
          <CartList
            carts={carts}
            selectedCart={selectedCart}
            onSelectCart={setSelectedCart}
            onCreateCart={handleCreateCart}
            onEditCart={handleEditCart}
            onDeleteCart={handleDeleteCart}
          />
        </div>

        <div className="sidebar-actions">
          <button className="btn-primary" onClick={handleCreateCart}>
            + Create New Cart
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="map-container">
        <MapView carts={carts} selectedCart={selectedCart} />
      </div>

      {showModal && (
        <CartModal
          cart={editingCart}
          onSave={handleSaveCart}
          onClose={() => {
            setShowModal(false);
            setEditingCart(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
