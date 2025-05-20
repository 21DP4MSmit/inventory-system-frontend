<template>
  <v-app theme="dark">
    <SidebarLayout v-if="isAuthenticated" v-model="drawerOpen" />
    <v-main
      :class="{
        'sidebar-active': isAuthenticated && drawerOpen,
        'sidebar-rail': isAuthenticated && !drawerOpen,
      }"
    >
      <v-container fluid class="px-md-6 py-md-4 px-3 py-3">
        <router-view />
      </v-container>
    </v-main>
    <NotificationSystem />

    <v-snackbar
      v-model="orientationWarning"
      timeout="3000"
      color="info"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-rotate-right</v-icon>
        <span>Rotate device for better experience with data tables</span>
      </div>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import SidebarLayout from "./layouts/SidebarLayout.vue";
import NotificationSystem from "./components/NotificationSystem.vue";
import { useUserStore } from "./stores/user";

const drawerOpen = ref(true);
const userStore = useUserStore();
const route = useRoute();
const orientationWarning = ref(false);
const dataTableViews = ["/inventory", "/transactions", "/categories", "/admin"];

userStore.initialize();

const isAuthenticated = computed(() => userStore.isAuthenticated);

const handleOrientationChange = () => {
  if (
    window.innerWidth < 768 &&
    window.innerHeight > window.innerWidth &&
    dataTableViews.some((path) => route.path.startsWith(path))
  ) {
    orientationWarning.value = true;
  } else {
    orientationWarning.value = false;
  }

  if (window.innerWidth < 768) {
    drawerOpen.value = false;
  }
};

onMounted(() => {
  handleOrientationChange();
  window.addEventListener("resize", handleOrientationChange);

  watch(
    () => route.path,
    () => {
      handleOrientationChange();

      if (window.innerWidth < 768) {
        drawerOpen.value = false;
      }
    }
  );
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleOrientationChange);
});

watch(drawerOpen, (newValue) => {
  console.log("Drawer state changed:", newValue);
});
</script>

<style>
@media (max-width: 768px) {
  .v-data-table td,
  .v-data-table th {
    padding: 0 8px !important;
  }

  .v-field__input {
    font-size: 16px !important;
  }

  .v-dialog {
    margin: 8px !important;
    width: calc(100% - 16px) !important;
  }

  .v-card-text {
    padding: 16px !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .v-navigation-drawer {
    width: 250px !important;
  }

  .v-navigation-drawer--rail {
    width: 64px !important;
  }
}

:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
}

.v-application {
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
}

.mobile-bottom-nav {
  padding-bottom: var(--safe-area-inset-bottom);
}

.sidebar-active {
  padding-left: 256px !important;
  transition: padding-left 0.3s ease;
}

.sidebar-rail {
  padding-left: 64px !important;
  transition: padding-left 0.3s ease;
}

@media (max-width: 960px) {
  .sidebar-active,
  .sidebar-rail {
    padding-left: 0 !important;
  }
}
</style>
