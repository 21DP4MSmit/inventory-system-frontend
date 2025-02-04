import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import InventoryView from "./views/InventoryView.vue";
import CategoryView from "./views/CategoryView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/inventory", component: InventoryView },
  { path: "/categories", component: CategoryView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
