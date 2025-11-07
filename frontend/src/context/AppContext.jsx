// import { createContext } from "react";
// import { useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useEffect } from "react";

// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//   const currencySymbol = "$";
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [doctors, setDoctors] = useState([]);

//   const [token, setToken] = useState(localStorage.getItem("token") || false);
//   const [userData, setUserData] = useState(false);

//   const getDoctorsData = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/doctor/list");
//       if (data.success) {
//         setDoctors(data.doctors);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to fetch doctors");
//     }
//   };

//   const loadUserProfileData = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
//         headers: { token },
//       });

//       if (data.success) {
//         setUserData(data.userData);
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Failed to load user profile"
//       );
//     }
//   };

//   useEffect(() => {
//     getDoctorsData();
//   }, []);

//   useEffect(() => {
//     if (token) {
//       loadUserProfileData();
//     } else {
//       setUserData(false);
//     }
//   }, [token]);

//   const value = {
//     doctors,
//     currencySymbol,
//     backendUrl,
//     token,
//     setToken,
//     userData,
//     setUserData,
//     loadUserProfileData,
//     getDoctorsData,
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };

// export default AppContextProvider;


import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(false);

  // ✅ Clean invalid token on first load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      setToken(storedToken);
    } else {
      localStorage.removeItem("token");
      setToken("");
    }
  }, []);

  // ✅ Fetch all doctors
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) setDoctors(data.doctors);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch doctors");
    }
  };

  // ✅ Fetch user profile (correct token header)
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setUserData(data.userData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load user profile");
    }
  };

  // Load doctors initially
  useEffect(() => {
    getDoctorsData();
  }, []);

  // Load user profile whenever token changes
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  const value = {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    getDoctorsData,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
