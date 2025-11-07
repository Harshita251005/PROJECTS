import axios from "axios";

const backendUrl = "http://localhost:8000"; // backend URL

// Get token safely from localStorage
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    return null;
  }
  return token;
};

// Axios instance
const api = axios.create({
  baseURL: backendUrl,
});

// Interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
