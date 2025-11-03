// src/pages/TrackOrderPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import OrderTracking from "../OrderTracking/OrderTracking";


const TrackOrderPage = () => {
  const { orderId } = useParams();
  return <OrderTracking orderId={orderId} />;
};

export default TrackOrderPage;
