import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./stores/user";
import { useNotificationStore } from "./stores/notification";

import HomePage from "./views/HomePage.vue";
import LoginView from "./views/LoginView.vue";
import InventoryView from "./views/InventoryView.vue";
import CategoryView from "./views/CategoryView.vue";
import DashboardView from "./views/DashboardView.vue";
import AdminPanelView from "./views/AdminPanelView.vue";
import TransactionView from "./views/TransactionView.vue";
import AIDetectionView from "./views/AIDetectionView.vue";
import ReportsView from "./views/ReportsView.vue";
import ProfileView from "./views/ProfileView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true, requiredPermission: "view_dashboard" },
  },
  {
    path: "/inventory",
    name: "inventory",
    component: InventoryView,
    meta: { requiresAuth: true, requiredPermission: "view_inventory" },
  },
  {
    path: "/categories",
    name: "categories",
    component: CategoryView,
    meta: { requiresAuth: true, requiredPermission: "view_categories" },
  },
  {
    path: "/transactions",
    name: "transactions",
    component: TransactionView,
    meta: { requiresAuth: true, requiredPermission: "view_transactions" },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPanelView,
    meta: { requiresAuth: true, requiredPermission: "view_users" },
  },
  {
    path: "/ai-detection",
    name: "ai-detection",
    component: AIDetectionView,
    meta: { requiresAuth: true, requiredPermission: "use_ai_detection" },
  },
  {
    path: "/reports",
    name: "reports",
    component: ReportsView,
    meta: { requiresAuth: true, requiredPermission: "view_reports" },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { path: "/" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  if (!userStore.isAuthenticated) {
    await userStore.initialize();
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    notificationStore.warning("Please login to access this page");
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (
    to.meta.requiredPermission &&
    !userStore.hasPermission(to.meta.requiredPermission)
  ) {
    if (userStore.isAuthenticated) {
      notificationStore.warning(
        "You do not have permission to access this page"
      );

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
