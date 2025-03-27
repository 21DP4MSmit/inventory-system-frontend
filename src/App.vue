<template>
  <v-app theme="dark">
    <SidebarLayout v-if="isAuthenticated" v-model="drawerOpen" />
    <v-main>
      <router-view />
    </v-main>
    <NotificationSystem />
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import SidebarLayout from "./layouts/SidebarLayout.vue";
import NotificationSystem from "./components/NotificationSystem.vue";
import { useUserStore } from "./stores/user";

const drawerOpen = ref(true);
const userStore = useUserStore();

userStore.initialize();

const isAuthenticated = computed(() => userStore.isAuthenticated);

watch(drawerOpen, (newValue) => {
  console.log("Drawer state changed:", newValue);
});
</script>
