// src/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001", // La URL de tu backend
});

// Agregar el token JWT en cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Suponiendo que el token esté en localStorage

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
