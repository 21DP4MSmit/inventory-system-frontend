import axios from "axios";
import { useUserStore } from "./stores/user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const publicRoutes = ["/items", "/categories"];
    const isPublicRoute = publicRoutes.some(
      (route) => config.url.includes(route) && config.method === "get"
    );

    if (!isPublicRoute) {
      const userStore = useUserStore();
      const token = userStore.token || localStorage.getItem("token");

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    if (error.response?.status === 401 && error.config.url !== "/login") {
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
