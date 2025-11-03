import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./OrderTracking.css";

// ✅ Create socket only once (outside the component)
const socket = io("http://localhost:5000", { transports: ["websocket"] });

const OrderTracking = ({ orderId }) => {
  const [status, setStatus] = useState("Placed");

  useEffect(() => {
    if (!orderId) return;

    // ✅ Join the specific order room
    socket.emit("join_order", orderId);

    // ✅ Listen for order status updates
    const handleUpdate = (newStatus) => {
      console.log("New order status:", newStatus);
      setStatus(newStatus);
    };

    socket.on("order_update", handleUpdate);

    // ✅ Cleanup: remove the event listener, NOT the socket itself
    return () => {
      socket.off("order_update", handleUpdate);
    };
  }, [orderId]);

  return (
    <div className="tracking-container">
      <h2>Order Tracking</h2>
      <p><strong>Order ID:</strong> {orderId}</p>
      <p className="status">
        Current Status: <span>{status}</span>
      </p>
    </div>
  );
};

export default OrderTracking;
