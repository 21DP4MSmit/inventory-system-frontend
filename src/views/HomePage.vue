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
  </v-container>
</template>

<script>
import api from "../api.js";

export default {
  data() {
    return {
      stockItems: [],
      search: "",
      loading: true,
      headers: [
        { title: "Item Name", key: "name", sortable: true },
        { title: "Category", key: "category_name", sortable: true },
        { title: "Quantity", key: "quantity", sortable: true, align: "center" },
        { title: "Last Updated", key: "updated_at", sortable: true },
      ],
    };
  },

  async created() {
    await this.fetchStock();
  },

  methods: {
    async fetchStock() {
      try {
        const response = await api.get("/items");
        // temp
        this.stockItems = response.data.map((item) => ({
          ...item,
          category_name: this.getCategoryName(item.category_id),
          updated_at: new Date().toLocaleDateString(),
        }));
      } catch (error) {
        console.error("Error fetching stock:", error.response?.data || error);
      } finally {
        this.loading = false;
      }
    },

    getCategoryName(categoryId) {
      // temp
      const categories = {
        1: "Electronics",
        2: "Office Supplies",
        3: "Furniture",
      };
      return categories[categoryId] || `Category ${categoryId}`;
    },

    getQuantityColor(quantity) {
      if (quantity <= 5) return "error";
      if (quantity <= 20) return "warning";
      return "success";
    },

    goToLogin() {
      this.$router.push("/login");
    },
  },
};
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
</style>
