<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="welcome-card overflow-hidden">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="6"
              class="d-flex flex-column justify-center pa-6"
            >
              <h1 class="text-h3 font-weight-bold mb-2">Inventory System</h1>
              <p class="text-body-1 mb-6">
                Manage your inventory with ease. Get real-time updates on stock
                levels, categories, and more.
              </p>
              <div>
                <v-btn
                  color="primary"
                  size="large"
                  min-width="150"
                  class="mr-3 text-none"
                  prepend-icon="mdi-login"
                  @click="goToLogin"
                >
                  Login
                </v-btn>
                <v-btn
                  variant="tonal"
                  size="large"
                  class="text-none"
                  prepend-icon="mdi-information-outline"
                  @click="showFeatures = true"
                >
                  Learn More
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-none d-md-block">
              <div
                class="bg-gradient fill-height d-flex align-center justify-center pa-6"
              >
                <v-icon size="200" color="white" class="opacity-80"
                  >mdi-view-dashboard</v-icon
                >
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-6" elevation="2">
      <v-card-title class="py-4 px-6 bg-background-light d-flex align-center">
        <v-icon size="24" class="mr-2">mdi-package-variant</v-icon>
        <span class="text-h5">Available Stock</span>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Search items"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="search-field"
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="stockItems"
        :search="search"
        class="inventory-table"
        :loading="loading"
        loading-text="Loading stock data..."
        :items-per-page="5"
      >
        <template v-slot:item.quantity="{ item }">
          <v-chip
            :color="getQuantityColor(item.quantity)"
            size="small"
            class="font-weight-medium"
          >
            {{ item.quantity }}
          </v-chip>
        </template>

        <template v-slot:item.category_name="{ item }">
          <v-chip variant="tonal" size="small" class="font-weight-medium">
            {{ item.category_name }}
          </v-chip>
        </template>

        <template v-slot:item.updated_at="{ item }">
          {{ formatDate(item.updated_at) }}
        </template>

        <template v-slot:bottom>
          <div class="text-center pt-2 pb-2">
            <v-btn
              variant="tonal"
              color="primary"
              class="text-none"
              prepend-icon="mdi-login"
              @click="goToLogin"
            >
              Login to view full inventory
            </v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-6 text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-3"
              >mdi-package-variant</v-icon
            >
            <p>No inventory items available</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Features Dialog -->
    <v-dialog v-model="showFeatures" max-width="700">
      <v-card>
        <v-card-title class="py-4 px-6 bg-primary text-white">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          Key Features
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col
              cols="12"
              md="6"
              v-for="(feature, index) in features"
              :key="index"
            >
              <div class="d-flex mb-4">
                <v-avatar color="primary" class="mr-4">
                  <v-icon color="white">{{ feature.icon }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold mb-1">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2">{{ feature.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="goToLogin" class="text-none">
            Get Started
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationStore } from "../stores/notification";
import api from "../api.js";

const router = useRouter();
const notificationStore = useNotificationStore();

const stockItems = ref([]);
const categories = ref([]);
const search = ref("");
const loading = ref(true);
const showFeatures = ref(false);

const headers = [
  { title: "Item Name", key: "name", sortable: true },
  { title: "Category", key: "category_name", sortable: true },
  { title: "Quantity", key: "quantity", sortable: true, align: "center" },
  { title: "Last Updated", key: "updated_at", sortable: true },
];

const features = [
  {
    icon: "mdi-clipboard-check-outline",
    title: "Real-time Inventory Tracking",
    description:
      "Monitor stock levels instantly with automatic updates as items move in and out.",
  },
  {
    icon: "mdi-tag-multiple",
    title: "Category Management",
    description:
      "Organize your inventory with custom categories for easy filtering and reporting.",
  },
  {
    icon: "mdi-chart-bar",
    title: "Visual Analytics",
    description:
      "Get insights into inventory trends with interactive charts and reports.",
  },
  {
    icon: "mdi-bell-outline",
    title: "Low Stock Alerts",
    description:
      "Receive notifications when items are running low to prevent stockouts.",
  },
  {
    icon: "mdi-history",
    title: "Transaction History",
    description:
      "Track all inventory movements with detailed transaction logs.",
  },
  {
    icon: "mdi-account-group",
    title: "User Roles",
    description:
      "Control access with customizable permissions for different team members.",
  },
];

const fetchStock = async () => {
  try {
    loading.value = true;

    await fetchCategories();

    const response = await api.get("/items");
    stockItems.value = response.data.map((item) => ({
      ...item,
      category_name: getCategoryName(item.category_id),
      updated_at: item.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching stock:", error.response?.data || error);
    notificationStore.error("Could not load inventory data");
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find((c) => c.category_id === categoryId);
  if (category) return category.category_name;
};

const getQuantityColor = (quantity) => {
  if (quantity <= 5) return "error";
  if (quantity <= 20) return "warning";
  return "success";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const goToLogin = () => {
  router.push("/login");
};

onMounted(async () => {
  await fetchStock();
});
</script>

<style scoped>
.welcome-card {
  border-radius: 12px;
  overflow: hidden;
}

.bg-gradient {
  background: linear-gradient(
    145deg,
    var(--primary-color),
    var(--accent-color)
  );
}

.inventory-table {
  border-radius: 0 0 12px 12px;
}

.search-field {
  transition: max-width 0.3s ease;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 100% !important;
  }
}

.v-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}
</style>
