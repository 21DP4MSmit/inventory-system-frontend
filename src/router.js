import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import InventoryView from "./views/InventoryView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/inventory", component: InventoryView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
