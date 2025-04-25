import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./stores/user";

import HomePage from "./views/HomePage.vue";
import LoginView from "./views/LoginView.vue";
import InventoryView from "./views/InventoryView.vue";
import CategoryView from "./views/CategoryView.vue";
import DashboardView from "./views/DashboardView.vue";
import AdminPanelView from "./views/AdminPanelView.vue";
import TransactionView from "./views/TransactionView.vue";
import AIDetectionView from "./views/AIDetectionView.vue";
import ReportsView from "./views/ReportsView.vue";

const routes = [
  { path: "/", component: HomePage, meta: { requiresAuth: false } },
  { path: "/login", component: LoginView, meta: { requiresAuth: false } },
  {
    path: "/dashboard",
    component: DashboardView,
    meta: { requiresAuth: true, requiredPermission: "view_dashboard" },
  },
  {
    path: "/inventory",
    component: InventoryView,
    meta: { requiresAuth: true, requiredPermission: "view_inventory" },
  },
  {
    path: "/categories",
    component: CategoryView,
    meta: { requiresAuth: true, requiredPermission: "view_categories" },
  },
  {
    path: "/transactions",
    component: TransactionView,
    meta: { requiresAuth: true, requiredPermission: "view_transactions" },
  },
  {
    path: "/admin",
    component: AdminPanelView,
    meta: { requiresAuth: true, requiredPermission: "view_users" },
  },
  {
    path: "/ai-detection",
    component: AIDetectionView,
    meta: { requiresAuth: true, requiredPermission: "use_ai_detection" },
  },
  {
    path: "/reports",
    component: ReportsView,
    meta: { requiresAuth: true, requiredPermission: "view_reports" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.isAuthenticated) {
    await userStore.initialize();
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return next("/login");
  }

  if (
    to.meta.requiredPermission &&
    !userStore.hasPermission(to.meta.requiredPermission)
  ) {
    if (userStore.isAuthenticated) {
      if (to.path !== "/dashboard") {
        return next("/dashboard");
      } else {
        return next();
      }
    } else {
      return next("/login");
    }
  }

  if (
    (to.path === "/login" || to.path === "/register") &&
    userStore.isAuthenticated
  ) {
    return next("/dashboard");
  }

  next();
});

export default router;
