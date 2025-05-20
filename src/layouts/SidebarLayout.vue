<template>
  <div>
    <!-- Mobile Bottom Navigation -->
    <div class="mobile-bottom-nav d-md-none">
      <v-bottom-navigation bg-color="sidebar-gradient" color="white">
        <v-btn v-for="item in mobileMenuItems" :key="item.path" :to="item.path">
          <v-icon>{{ item.icon }}</v-icon>
          <span class="text-caption">{{ item.title }}</span>
        </v-btn>
      </v-bottom-navigation>
    </div>

    <!-- Desktop Sidebar -->
    <v-navigation-drawer
      v-model="isDrawerOpen"
      :rail="rail"
      location="left"
      elevation="2"
      class="sidebar-gradient d-none d-md-block full-height-sidebar"
      @update:rail="handleRailUpdate"
      permanent
    >
      <!-- Inventory System Title -->
      <v-list-item
        prepend-icon="mdi-warehouse"
        title="Inventory System"
        nav
        class="px-2 py-4"
        @click="handleWarehouseClick"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            @click.stop="toggleRail"
            color="white"
            aria-label="Toggle Rail"
          ></v-btn>
        </template>
      </v-list-item>

      <!-- User Profile Section -->
      <template v-if="userInfo">
        <v-divider></v-divider>
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar size="40">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ userInfo.username }}</v-list-item-title>
          <v-list-item-subtitle>{{ userInfo.role }}</v-list-item-subtitle>
        </v-list-item>
      </template>

      <v-divider></v-divider>

      <!-- Menu Items -->
      <v-list density="compact" nav class="py-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :prepend-icon="item.icon"
          link
          class="mb-1"
          active-class="active-nav-item"
          tabindex="0"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-tooltip v-if="rail" location="right">
            <template v-slot:activator="{ props }">
              <span v-bind="props"></span>
            </template>
            <span>{{ item.title }}</span>
          </v-tooltip>
        </v-list-item>
      </v-list>

      <!-- Profile and Logout Buttons -->
      <template v-if="userInfo">
        <v-divider></v-divider>
        <v-list-item class="pa-2">
          <v-btn
            block
            variant="text"
            @click="goToProfile"
            :class="{ 'justify-start': !rail, 'justify-center': rail }"
          >
            <v-icon>mdi-account</v-icon>
            <span v-if="!rail" class="ml-2">Profile</span>
          </v-btn>
        </v-list-item>
        <v-list-item class="pa-2">
          <v-btn
            block
            variant="text"
            @click="logout"
            :class="{ 'justify-start': !rail, 'justify-center': rail }"
          >
            <v-icon>mdi-logout</v-icon>
            <span v-if="!rail" class="ml-2">Logout</span>
          </v-btn>
        </v-list-item>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const userStore = useUserStore();

const rail = ref(false);
const previousDrawerState = ref(true);

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const userInfo = computed(() => userStore.getUserInfo);

const menuItems = computed(() => {
  const items = [
    { title: "Dashboard", path: "/dashboard", icon: "mdi-view-dashboard" },
    { title: "Inventory", path: "/inventory", icon: "mdi-clipboard-list" },
    { title: "Transactions", path: "/transactions", icon: "mdi-history" },
    { title: "Categories", path: "/categories", icon: "mdi-tag" },
    { title: "Reports", path: "/reports", icon: "mdi-file-chart" },
    { title: "AI Detection", path: "/ai-detection", icon: "mdi-image-search" },
  ];

  if (userInfo.value?.role === "admin") {
    items.push({
      title: "Admin Panel",
      path: "/admin",
      icon: "mdi-shield-account",
    });
  }

  return items;
});

const mobileMenuItems = computed(() => {
  const essentialItems = [
    { title: "Dashboard", path: "/dashboard", icon: "mdi-view-dashboard" },
    { title: "Inventory", path: "/inventory", icon: "mdi-clipboard-list" },
    { title: "Transactions", path: "/transactions", icon: "mdi-history" },
    { title: "AI Detection", path: "/ai-detection", icon: "mdi-image-search" },
    { title: "Profile", path: "/profile", icon: "mdi-account" },
  ];

  return essentialItems;
});

const toggleRail = () => {
  if (rail.value) {
    rail.value = false;
    isDrawerOpen.value = previousDrawerState.value;
  } else {
    previousDrawerState.value = isDrawerOpen.value;
    rail.value = true;
    isDrawerOpen.value = true;
  }
};

const handleRailUpdate = (value) => {
  rail.value = value;
  if (!value) {
    isDrawerOpen.value = previousDrawerState.value;
  }
};

const handleWarehouseClick = () => {
  if (rail.value) {
    rail.value = false;
    isDrawerOpen.value = true;
  }
};

const goToProfile = () => {
  router.push("/profile");
};

const logout = () => {
  userStore.logout();
  router.push("/login");
};

const updateSidebarHeight = () => {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty("--viewport-height", `${vh}px`);
};

onMounted(() => {
  updateSidebarHeight();
  window.addEventListener("resize", updateSidebarHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateSidebarHeight);
});
</script>

<style scoped>
:root {
  --viewport-height: 100vh;
}

.full-height-sidebar {
  height: var(--viewport-height) !important;
  max-height: var(--viewport-height) !important;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.sidebar-gradient {
  background: linear-gradient(
    145deg,
    var(--primary-color),
    var(--secondary-color)
  ) !important;
  color: var(--text-primary) !important;
}

.active-nav-item {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
  border-left: 4px solid var(--accent-color);
}

.v-navigation-drawer {
  transition: all 0.3s ease;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.2);
}

.v-btn--icon {
  transition: transform 0.3s ease;
}

.v-btn--icon:hover {
  transform: scale(1.1);
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transition: background-color 0.3s ease;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  :deep(.v-main) {
    padding-bottom: 56px !important;
  }

  .full-height-sidebar {
    height: auto !important;
    max-height: none !important;
    position: relative;
  }
}

@media (max-width: 600px) {
  .v-bottom-navigation .v-btn {
    min-width: 0 !important;
  }

  .v-bottom-navigation .v-btn .v-btn__content {
    flex-direction: column;
  }

  .v-bottom-navigation .v-btn .v-btn__content span {
    margin-top: 4px;
    font-size: 0.625rem !important;
  }
}
</style>
