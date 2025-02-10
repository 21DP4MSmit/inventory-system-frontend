import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./stores/user";
import HomePage from "./views/HomePage.vue";
import LoginView from "./views/LoginView.vue";
import InventoryView from "./views/InventoryView.vue";
import CategoryView from "./views/CategoryView.vue";
import DashboardView from "./views/DashboardView.vue";

const routes = [
  { path: "/", component: HomePage, meta: { requiresAuth: false } },
  { path: "/login", component: LoginView, meta: { requiresAuth: false } },
  {
    path: "/dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/inventory",
    component: InventoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    component: CategoryView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.isAuthenticated) {
    userStore.initialize();
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresAdmin) {
    // Allow both admin and staff to access categories, but restrict staff to view-only
    if (userStore.user?.role === "staff" && to.path === "/categories") {
      next();
    } else if (!userStore.isAdmin) {
      console.log("Access denied. Redirecting to dashboard.");
      next("/dashboard");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
