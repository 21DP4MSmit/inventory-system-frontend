<template>
  <v-container class="py-6">
    <v-row>
      <!-- Welcome Card -->
      <v-col cols="12">
        <v-card elevation="3" class="welcome-card overflow-hidden">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="6"
              class="d-flex flex-column justify-center pa-6"
            >
              <h1 class="text-h3 font-weight-bold mb-2">
                Welcome, {{ userInfo?.username || "User" }}
              </h1>
              <p class="text-body-1 mb-6">
                Manage your inventory with ease. Get real-time updates on stock
                levels, categories, and transaction history.
              </p>
              <div>
                <v-btn
                  color="primary"
                  size="large"
                  min-width="150"
                  class="mr-3 text-none"
                  prepend-icon="mdi-clipboard-list"
                  @click="navigateTo('/inventory')"
                >
                  Inventory
                </v-btn>
                <v-btn
                  variant="tonal"
                  size="large"
                  class="text-none"
                  prepend-icon="mdi-history"
                  @click="navigateTo('/transactions')"
                >
                  Transactions
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

    <!-- Stats Cards -->
    <v-row class="mt-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="stats-card">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-overline mb-1">Total Items</p>
                <p class="text-h4 font-weight-bold">
                  {{ statsData.totalItems }}
                </p>
              </div>
              <v-avatar color="primary" size="56" class="elevation-1">
                <v-icon size="32" color="white">mdi-package-variant</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="stats-card">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-overline mb-1">Low Stock</p>
                <p class="text-h4 font-weight-bold">
                  {{ statsData.lowStockItems }}
                </p>
              </div>
              <v-avatar color="error" size="56" class="elevation-1">
                <v-icon size="32" color="white">mdi-alert-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="stats-card">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-overline mb-1">Categories</p>
                <p class="text-h4 font-weight-bold">
                  {{ statsData.totalCategories }}
                </p>
              </div>
              <v-avatar color="success" size="56" class="elevation-1">
                <v-icon size="32" color="white">mdi-tag</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="stats-card">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-overline mb-1">Transactions</p>
                <p class="text-h4 font-weight-bold">
                  {{ statsData.totalTransactions }}
                </p>
              </div>
              <v-avatar color="info" size="56" class="elevation-1">
                <v-icon size="32" color="white">mdi-swap-horizontal</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions and Chart -->
    <v-row class="mt-6">
      <!-- Left side - Quick Actions -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="h-100">
          <v-card-title
            class="py-4 px-6 bg-background-light d-flex align-center"
          >
            <v-icon size="24" class="mr-2">mdi-lightning-bolt</v-icon>
            <span class="text-h5">Quick Actions</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-btn
              block
              color="success"
              size="large"
              class="mb-4 text-none"
              prepend-icon="mdi-arrow-down-bold-box"
              @click="openQuickTransaction('in')"
            >
              Stock In
            </v-btn>

            <v-btn
              block
              color="error"
              size="large"
              class="mb-4 text-none"
              prepend-icon="mdi-arrow-up-bold-box"
              @click="openQuickTransaction('out')"
            >
              Stock Out
            </v-btn>

            <v-divider class="my-4"></v-divider>

            <v-btn
              block
              color="primary"
              variant="tonal"
              size="large"
              class="mb-4 text-none"
              prepend-icon="mdi-plus-circle"
              @click="navigateTo('/inventory')"
            >
              Add New Item
            </v-btn>

            <v-btn
              block
              variant="tonal"
              size="large"
              class="text-none"
              prepend-icon="mdi-tag-plus"
              @click="navigateTo('/categories')"
            >
              Add New Category
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right side - Chart -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="h-100">
          <v-card-title
            class="py-4 px-6 bg-background-light d-flex align-center"
          >
            <v-icon size="24" class="mr-2">mdi-chart-line</v-icon>
            <span class="text-h5">Transaction History</span>
            <v-spacer></v-spacer>
            <v-btn-toggle
              v-model="chartPeriod"
              mandatory
              density="comfortable"
              variant="outlined"
            >
              <v-btn value="week">Week</v-btn>
              <v-btn value="month">Month</v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text class="pa-6 pt-4">
            <div v-if="chartData" class="chart-wrapper">
              <div class="chart-legend d-flex align-center mb-4">
                <div class="legend-item d-flex align-center mr-4">
                  <div class="legend-color-in mr-2"></div>
                  <span class="text-body-2">Stock In</span>
                </div>
                <div class="legend-item d-flex align-center">
                  <div class="legend-color-out mr-2"></div>
                  <span class="text-body-2">Stock Out</span>
                </div>
              </div>

              <div class="chart-container">
                <!-- Y-axis labels -->
                <div class="y-axis">
                  <div
                    v-for="(value, i) in yAxisValues"
                    :key="i"
                    class="y-tick"
                  >
                    <span class="y-label">{{ value }}</span>
                  </div>
                </div>

                <!-- Chart grid & bars -->
                <div class="chart-grid">
                  <!-- Horizontal grid lines -->
                  <div
                    v-for="(value, i) in yAxisValues"
                    :key="`grid-${i}`"
                    class="h-grid-line"
                    :style="{ bottom: `${i * 20}%` }"
                  ></div>

                  <!-- Data columns -->
                  <div class="chart-columns">
                    <div
                      v-for="(label, index) in chartData.labels"
                      :key="index"
                      class="chart-column"
                      @mouseenter="hoveredColumn = index"
                      @mouseleave="hoveredColumn = null"
                    >
                      <!-- Date label at bottom -->
                      <div class="x-label">{{ label }}</div>

                      <div class="bars-container">
                        <!-- Stock In Bar -->
                        <div
                          v-if="chartData.inData[index] > 0"
                          class="chart-bar in-bar"
                          :class="{ highlight: hoveredColumn === index }"
                          :style="{
                            height: `${getBarHeight(
                              chartData.inData[index],
                              chartData.maxValue
                            )}%`,
                          }"
                        >
                          <div class="tooltip" v-if="hoveredColumn === index">
                            In: {{ chartData.inData[index] }}
                          </div>
                        </div>

                        <!-- Stock Out Bar -->
                        <div
                          v-if="chartData.outData[index] > 0"
                          class="chart-bar out-bar"
                          :class="{ highlight: hoveredColumn === index }"
                          :style="{
                            height: `${getBarHeight(
                              chartData.outData[index],
                              chartData.maxValue
                            )}%`,
                          }"
                        >
                          <div class="tooltip" v-if="hoveredColumn === index">
                            Out: {{ chartData.outData[index] }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="d-flex justify-center align-center"
              style="height: 300px"
            >
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Low Stock Alert -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title
            class="py-4 px-6 bg-background-light d-flex align-center"
          >
            <v-icon size="24" color="error" class="mr-2"
              >mdi-alert-circle</v-icon
            >
            <span class="text-h5">Low Stock Alert</span>
            <v-spacer></v-spacer>
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              class="text-none"
              @click="navigateTo('/inventory')"
            >
              View All
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="lowStockHeaders"
            :items="lowStockItems"
            class="inventory-table"
            :loading="loading"
            density="comfortable"
          >
            <template v-slot:item.quantity="{ item }">
              <v-chip color="error" size="small" class="font-weight-medium">
                {{ item.quantity }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-arrow-down-bold-box"
                variant="text"
                color="success"
                size="small"
                class="mr-1"
                @click="openQuickTransactionForItem(item, 'in')"
              ></v-btn>
            </template>

            <template v-slot:no-data>
              <div class="pa-6 text-center">
                <v-icon size="48" color="success" class="mb-3"
                  >mdi-check-circle</v-icon
                >
                <p>No low stock items - excellent!</p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Transaction Dialog -->
    <form-dialog
      v-model="quickTransactionDialog"
      title="Quick Transaction"
      :loading="transactionLoading"
      submit-button-text="Save"
      @submit="submitQuickTransaction"
      @cancel="quickTransactionDialog = false"
    >
      <v-select
        v-model="transactionData.item_id"
        :items="allItems"
        item-title="name"
        item-value="item_id"
        label="Select Item"
        :rules="[(v) => !!v || 'Item is required']"
        required
        variant="outlined"
        density="comfortable"
        class="mb-2"
        :error-messages="transactionErrors.item_id"
      ></v-select>

      <v-text-field
        v-model="transactionData.quantity_change"
        label="Quantity"
        type="number"
        min="1"
        :rules="[
          (v) => !!v || 'Quantity is required',
          (v) => v > 0 || 'Quantity must be positive',
        ]"
        required
        variant="outlined"
        density="comfortable"
        class="mb-2"
        :error-messages="transactionErrors.quantity_change"
      ></v-text-field>

      <v-textarea
        v-model="transactionData.notes"
        label="Notes (optional)"
        variant="outlined"
        density="comfortable"
        rows="3"
      ></v-textarea>
    </form-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../api.js";
import { useNotificationStore } from "../stores/notification";
import { useUserStore } from "../stores/user";
import FormDialog from "../components/FormDialog.vue";

const notificationStore = useNotificationStore();
const userStore = useUserStore();
const router = useRouter();

const userInfo = computed(() => userStore.getUserInfo);

const chartPeriod = ref("week");
const loading = ref(true);
const transactionLoading = ref(false);
const hoveredColumn = ref(null);

const allItems = ref([]);
const lowStockItems = ref([]);
const transactionHistory = ref([]);
const categories = ref([]);
const statsData = reactive({
  totalItems: 0,
  lowStockItems: 0,
  totalCategories: 0,
  totalTransactions: 0,
});

const quickTransactionDialog = ref(false);
const transactionData = reactive({
  item_id: null,
  transaction_type: "in",
  quantity_change: null,
  notes: "",
});
const transactionErrors = reactive({
  item_id: "",
  quantity_change: "",
});

const yAxisValues = computed(() => {
  if (!chartData.value) return Array(6).fill(0);

  const max = chartData.value.maxValue;
  return Array(6)
    .fill(0)
    .map((_, i) => Math.round((max * (5 - i)) / 5));
});

const getBarHeight = (value, maxValue) => {
  if (!value || !maxValue) return 0;
  return Math.max((value / maxValue) * 100, 1);
};

const lowStockHeaders = [
  { title: "Item Name", key: "name", sortable: true },
  { title: "Category", key: "category_name", sortable: true },
  { title: "Quantity", key: "quantity", align: "center" },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const navigateTo = (path) => {
  router.push(path);
};

const fetchData = async () => {
  try {
    loading.value = true;

    const [itemsResponse, categoriesResponse, transactionsResponse] =
      await Promise.all([
        api.get("/items"),
        api.get("/categories"),
        api.get("/transactions"),
      ]);

    allItems.value = itemsResponse.data;
    lowStockItems.value = processLowStockItems(
      itemsResponse.data,
      categoriesResponse.data
    );

    categories.value = categoriesResponse.data;
    transactionHistory.value = transactionsResponse.data;

    updateStats(
      itemsResponse.data,
      categoriesResponse.data,
      transactionsResponse.data
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    notificationStore.error("Failed to load dashboard data. Please try again.");
  } finally {
    loading.value = false;
  }
};

const processLowStockItems = (items, categories) => {
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.category_id] = cat.category_name;
  });

  return items
    .filter((item) => item.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity)
    .map((item) => ({
      ...item,
      category_name: categoryMap[item.category_id] || "Unknown",
    }));
};

const updateStats = (items, categories, transactions) => {
  statsData.totalItems = items.length;
  statsData.lowStockItems = items.filter((item) => item.quantity <= 10).length;
  statsData.totalCategories = categories.length;
  statsData.totalTransactions = transactions.length;
};

const chartData = computed(() => {
  if (!transactionHistory.value?.length) return null;

  const data = processChartData();

  const allValues = [...data.inData, ...data.outData];
  const maxValue = Math.max(...allValues, 1);

  return {
    ...data,
    maxValue,
  };
});

const processChartData = () => {
  const now = new Date();
  let startDate;
  let dateFormat;
  let labels = [];

  if (chartPeriod.value === "week") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    dateFormat = { weekday: "short" };

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      labels.push(date.toLocaleDateString("en-US", dateFormat));
    }
  } else {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
    dateFormat = { month: "short", day: "numeric" };

    for (let i = 30; i >= 0; i -= 3) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      labels.push(date.toLocaleDateString("en-US", dateFormat));
    }
  }

  const inData = Array(labels.length).fill(0);
  const outData = Array(labels.length).fill(0);

  transactionHistory.value.forEach((transaction) => {
    const transactionDate = new Date(transaction.transaction_date);

    if (transactionDate < startDate) return;

    let index;
    if (chartPeriod.value === "week") {
      const dayDiff = Math.floor(
        (now - transactionDate) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff <= 6) {
        index = 6 - dayDiff;
      }
    } else {
      const dayDiff = Math.floor(
        (now - transactionDate) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff <= 30) {
        index = Math.floor(((labels.length - 1) * (30 - dayDiff)) / 30);
      }
    }

    if (index !== undefined) {
      if (transaction.transaction_type === "in") {
        inData[index] += transaction.quantity_change;
      } else {
        outData[index] += transaction.quantity_change;
      }
    }
  });

  return { labels, inData, outData };
};

const openQuickTransaction = (type) => {
  transactionData.transaction_type = type;
  transactionData.item_id = null;
  transactionData.quantity_change = null;
  transactionData.notes = "";
  clearTransactionErrors();
  quickTransactionDialog.value = true;
};

const openQuickTransactionForItem = (item, type) => {
  transactionData.transaction_type = type;
  transactionData.item_id = item.item_id;
  transactionData.quantity_change = null;
  transactionData.notes = "";
  clearTransactionErrors();
  quickTransactionDialog.value = true;
};

const clearTransactionErrors = () => {
  Object.keys(transactionErrors).forEach((key) => {
    transactionErrors[key] = "";
  });
};

const validateTransactionForm = () => {
  clearTransactionErrors();
  let isValid = true;

  if (!transactionData.item_id) {
    transactionErrors.item_id = "Item is required";
    isValid = false;
  }

  if (!transactionData.quantity_change) {
    transactionErrors.quantity_change = "Quantity is required";
    isValid = false;
  } else if (transactionData.quantity_change <= 0) {
    transactionErrors.quantity_change = "Quantity must be positive";
    isValid = false;
  }

  return isValid;
};

const submitQuickTransaction = async () => {
  if (!validateTransactionForm()) {
    return;
  }

  try {
    transactionLoading.value = true;

    const payload = {
      item_id: transactionData.item_id,
      transaction_type: transactionData.transaction_type,
      quantity_change: transactionData.quantity_change,
      notes:
        transactionData.notes ||
        `Quick ${
          transactionData.transaction_type === "in" ? "Stock In" : "Stock Out"
        } from Dashboard`,
    };

    await api.post("/transactions", payload);
    quickTransactionDialog.value = false;
    notificationStore.success("Transaction recorded successfully");

    await fetchData();
  } catch (error) {
    console.error("Error recording transaction:", error);
    notificationStore.error(
      "Error recording transaction: " +
        (error.response?.data?.error || "Unknown error")
    );
  } finally {
    transactionLoading.value = false;
  }
};

watch(chartPeriod, () => {
  if (chartData.value) {
    setTimeout(() => {
      createChart();
    }, 100);
  }
});

onMounted(async () => {
  await fetchData();
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

.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.inventory-table {
  border-radius: 0 0 12px 12px;
}

.h-100 {
  height: 100%;
}

.chart-wrapper {
  height: 350px;
}

.chart-container {
  display: flex;
  height: 300px;
  position: relative;
  margin-top: 10px;
}

.chart-legend {
  padding-left: 40px;
}

.legend-color-in,
.legend-color-out {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color-in {
  background-color: #4caf50;
}

.legend-color-out {
  background-color: #ff5252;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 25px;
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.y-tick {
  position: relative;
  text-align: right;
  padding-right: 10px;
}

.y-label {
  font-size: 10px;
  color: #b0bec5;
}

.chart-grid {
  position: relative;
  margin-left: 40px;
  height: 100%;
  flex-grow: 1;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.h-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.07);
}

.chart-columns {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 25px;
  display: flex;
}

.chart-column {
  flex: 1;
  position: relative;
  padding: 0 4px;
  min-width: 50px;
}

.chart-column:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.bars-container {
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.chart-bar {
  width: 45%;
  position: relative;
  border-radius: 3px 3px 0 0;
  transition: all 0.2s ease;
}

.in-bar {
  background-color: #4caf50;
}

.out-bar {
  background-color: #ff5252;
}

.highlight {
  filter: brightness(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.tooltip {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

.x-label {
  position: absolute;
  bottom: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  color: #b0bec5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
