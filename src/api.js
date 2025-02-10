import axios from "axios";
import { useUserStore } from "./stores/user";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token || localStorage.getItem("token");

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
    });

    const userStore = useUserStore();

    if (error.response?.status === 401) {
      console.warn("Unauthorized - Logging out user");
      userStore.logout();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
