import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./stores/user";

import HomePage from "./views/HomePage.vue";
import LoginView from "./views/LoginView.vue";
import InventoryView from "./views/InventoryView.vue";
import CategoryView from "./views/CategoryView.vue";
import DashboardView from "./views/DashboardView.vue";
import AdminPanelView from "./views/AdminPanelView.vue";
import TransactionView from "./views/TransactionView.vue";

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
    meta: { requiresAuth: true },
  },
  {
    path: "/transactions",
    component: TransactionView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: AdminPanelView,
    meta: { requiresAdmin: true },
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
    return next("/login");
  }

  if (to.meta.requiresAdmin) {
    if (userStore.user?.role === "staff" && to.path === "/categories") {
      return next();
    } else if (!userStore.isAdmin) {
      console.log("Access denied. Redirecting to dashboard.");
      return next("/dashboard");
    }
  }

  next();
});

export default router;
