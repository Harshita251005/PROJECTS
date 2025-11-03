// import React, { useContext, useEffect } from 'react'
// import './Verify.css'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { StoreContext } from './../../components/context/StoreContext';
// import axios from 'axios';

// const Verify = () => {

//     const [searchParams, setSearchParams] = useSearchParams();
//     const success = searchParams.get("success")
//     const orderId = searchParams.get("orderId")
//     const {url} = useContext(StoreContext);
//     const navigate = useNavigate();

//     const verifyPayment = async () =>{
//         const response = await axios.post(url+"/api/order/verify",{success, orderId});
//         if(response.data.success){
//             navigate('/myorders');
//         }
//         else{
//             navigate('/')
//         }
//     }

//     useEffect(()=>{
//         verifyPayment();
//     },[])
   
//   return (
//     <div className='verify'>
//         <div className="spinner"></div>
//     </div>
//   )
// }

// export default Verify


import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "./../../components/context/StoreContext";
import axios from "axios";
import OrderTracking from "../../OrderTracking/OrderTracking";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  const verifyPayment = async () => {
    try {
      const response = await axios.post(`${url}/api/order/verify`, {
        success,
        orderId,
      });

      if (response.data.success) {
        setVerified(true);
        navigate(`/order-tracking/${orderId}`);
      } else {
        setVerified(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerified(false);
    }
  }; // ✅ <-- this closing brace was missing

  useEffect(() => {
    verifyPayment();
  }, []); // ✅ runs once after component mounts

  return (
    <div className="verify">
      {!verified ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <h2 className="text-green-600 font-semibold">Payment Successful!</h2>
          <OrderTracking orderId={orderId} />
        </div>
      )}
    </div>
  );
};

export default Verify;
