import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api.js";
import { useNotificationStore } from "./notification";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const token = ref(null);
  const permissions = ref([]);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const getUserInfo = computed(() => user.value);

  const hasPermission = computed(() => (permission) => {
    return permissions.value.includes(permission);
  });

  async function fetchPermissions() {
    try {
      const response = await api.get("/permissions");
      permissions.value = response.data.permissions;
      return permissions.value;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }
  }

  async function login(credentials) {
    try {
      const response = await api.post("/login", credentials);
      const { access_token, user: userData } = response.data;

      token.value = access_token;
      user.value = userData;

      localStorage.setItem("token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      await fetchPermissions();

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  function logout() {
    const notificationStore = useNotificationStore();
    const username = user.value?.username;

    token.value = null;
    user.value = null;
    permissions.value = [];
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    if (username) {
      notificationStore.info(`Goodbye, ${username}! You've been logged out.`);
    }
  }

  async function initialize() {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      token.value = savedToken;
      api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      try {
        const decodedUser = decodeJWT(savedToken);
        if (decodedUser && decodedUser.role) {
          user.value = decodedUser;
          await fetchPermissions();
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  }

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  return {
    user,
    token,
    permissions,
    isAuthenticated,
    isAdmin,
    getUserInfo,
    hasPermission,
    login,
    logout,
    initialize,
    fetchPermissions,
  };
});
