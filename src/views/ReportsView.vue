<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title class="py-4 px-6 bg-background-light d-flex align-center">
        <v-icon size="24" class="mr-2">mdi-file-chart</v-icon>
        <span class="text-h5">Inventory Reports</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-card elevation="1" class="mb-4">
              <v-card-text>
                <h3 class="text-h6 mb-4">Report Parameters</h3>

                <v-select
                  v-model="reportType"
                  :items="reportTypes"
                  item-title="title"
                  item-value="value"
                  label="Report Type"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                ></v-select>

                <v-select
                  v-model="reportFormat"
                  :items="reportFormats"
                  item-title="title"
                  item-value="value"
                  label="Format"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                ></v-select>

                <v-select
                  v-if="reportType === 'category'"
                  v-model="selectedCategory"
                  :items="categories"
                  item-title="category_name"
                  item-value="category_id"
                  label="Select Category"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  clearable
                ></v-select>

                <v-select
                  v-if="reportType === 'transaction'"
                  v-model="transactionType"
                  :items="transactionTypes"
                  item-title="title"
                  item-value="value"
                  label="Transaction Type"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  clearable
                ></v-select>

                <v-row>
                  <v-col cols="6">
                    <v-menu
                      v-model="startDateMenu"
                      :close-on-content-click="false"
                      location="bottom"
                    >
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="startDate"
                          label="Start Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="props"
                          density="comfortable"
                          variant="outlined"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="startDate"
                        @update:model-value="startDateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="6">
                    <v-menu
                      v-model="endDateMenu"
                      :close-on-content-click="false"
                      location="bottom"
                    >
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="endDate"
                          label="End Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="props"
                          density="comfortable"
                          variant="outlined"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="endDate"
                        @update:model-value="endDateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>

                <v-btn
                  block
                  color="primary"
                  class="mt-4 text-none"
                  :loading="generating"
                  @click="generateReport"
                >
                  <v-icon class="mr-1">mdi-file-chart</v-icon>
                  Generate Report
                </v-btn>

                <v-btn
                  v-if="reportData"
                  block
                  color="success"
                  variant="tonal"
                  class="mt-2 text-none"
                  @click="downloadReport"
                >
                  <v-icon class="mr-1">mdi-download</v-icon>
                  Download Report
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card elevation="1" class="h-100">
              <v-card-text>
                <h3 class="text-h6 mb-4">Report Preview</h3>

                <div v-if="generating" class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                  <p class="mt-4">Generating report...</p>
                </div>

                <div v-else-if="reportData" class="report-preview">
                  <div class="text-center mb-4">
                    <h2 class="text-h5">{{ getReportTitle() }}</h2>
                    <p class="text-subtitle-1">{{ formatDateRange() }}</p>
                  </div>

                  <v-row class="mb-4">
                    <v-col
                      v-for="(stat, index) in reportData.summary"
                      :key="index"
                      cols="4"
                    >
                      <v-card
                        elevation="0"
                        class="text-center pa-4 bg-primary-lighten-5"
                      >
                        <h4 class="text-caption text-uppercase">
                          {{ stat.title }}
                        </h4>
                        <p class="text-h4 font-weight-bold">{{ stat.value }}</p>
                      </v-card>
                    </v-col>
                  </v-row>

                  <div v-if="reportData.chartData" class="chart-container mb-4">
                    <canvas ref="chartCanvas" height="250"></canvas>
                  </div>

                  <v-data-table
                    v-if="reportData.items"
                    :headers="reportData.headers"
                    :items="reportData.items"
                    class="mt-4"
                    density="comfortable"
                  ></v-data-table>
                </div>

                <div v-else class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-3"
                    >mdi-file-chart-outline</v-icon
                  >
                  <p>Select parameters and generate a report to see preview</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useNotificationStore } from "../stores/notification";
import { useUserStore } from "../stores/user";
import api from "../api.js";
import Chart from "chart.js/auto";

const notificationStore = useNotificationStore();
const userStore = useUserStore();

const hasReportsPermission = computed(() =>
  userStore.hasPermission("view_reports")
);

const reportType = ref("inventory");
const reportFormat = ref("pdf");
const selectedCategory = ref(null);
const transactionType = ref(null);
const startDate = ref(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
);
const endDate = ref(new Date().toISOString().substr(0, 10));
const startDateMenu = ref(false);
const endDateMenu = ref(false);

const categories = ref([]);
const generating = ref(false);
const reportData = ref(null);
const chartInstance = ref(null);
const chartCanvas = ref(null);

const reportTypes = [
  { title: "Inventory Status", value: "inventory" },
  { title: "Category Analysis", value: "category" },
  { title: "Transaction History", value: "transaction" },
  { title: "Low Stock Alert", value: "low-stock" },
];

const reportFormats = [
  { title: "PDF Document", value: "pdf" },
  { title: "Excel Spreadsheet", value: "excel" },
  { title: "CSV File", value: "csv" },
];

const transactionTypes = [
  { title: "All Transactions", value: null },
  { title: "Stock In", value: "in" },
  { title: "Stock Out", value: "out" },
];

async function fetchCategories() {
  try {
    const response = await api.get("/categories");
    categories.value = response.data;
  } catch (err) {
    notificationStore.error("Failed to load categories");
  }
}

function getReportTitle() {
  const typeMap = {
    inventory: "Inventory Status Report",
    category: "Category Analysis Report",
    transaction: "Transaction History Report",
    "low-stock": "Low Stock Alert Report",
  };

  let title = typeMap[reportType.value] || "Inventory Report";

  if (reportType.value === "category" && selectedCategory.value) {
    const category = categories.value.find(
      (c) => c.category_id === selectedCategory.value
    );
    if (category) {
      title += `: ${category.category_name}`;
    }
  }

  if (reportType.value === "transaction" && transactionType.value) {
    title += `: ${transactionType.value === "in" ? "Stock In" : "Stock Out"}`;
  }

  return title;
}

function formatDateRange() {
  return `${formatDate(startDate.value)} - ${formatDate(endDate.value)}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function generateReport() {
  if (!hasReportsPermission.value) {
    notificationStore.error("You do not have permission to generate reports");
    return;
  }

  generating.value = true;

  try {
    const params = {
      reportType: reportType.value,
      startDate: startDate.value,
      endDate: endDate.value,
    };

    if (reportType.value === "category" && selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }

    if (reportType.value === "transaction" && transactionType.value) {
      params.transactionType = transactionType.value;
    }

    const response = await api.get("/generate-report", { params });
    reportData.value = response.data;

    if (reportData.value.chartData) {
      setTimeout(() => {
        createChart();
      }, 100);
    }

    notificationStore.success("Report generated successfully");
  } catch (err) {
    notificationStore.error(
      err.response?.data?.error || "Error generating report"
    );
  } finally {
    generating.value = false;
  }
}

function createChart() {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  const chartData = reportData.value.chartData;

  chartInstance.value = new Chart(ctx, {
    type: chartData.type || "bar",
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#fff",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#b0bec5",
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#b0bec5",
          },
        },
      },
    },
  });
}

async function downloadReport() {
  if (!reportData.value) return;

  try {
    const params = {
      reportType: reportType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      format: reportFormat.value,
    };

    if (reportType.value === "category" && selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }

    if (reportType.value === "transaction" && transactionType.value) {
      params.transactionType = transactionType.value;
    }

    const response = await api.get("/download-report", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: getContentType(reportFormat.value),
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `inventory-report-${reportType.value}-${
      new Date().toISOString().split("T")[0]
    }.${reportFormat.value}`;
    link.click();

    notificationStore.success(`Report downloaded successfully`);
  } catch (err) {
    notificationStore.error("Error downloading report");
  }
}

function getContentType(format) {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.chart-container {
  position: relative;
  height: 250px;
  margin-top: 20px;
}

.bg-primary-lighten-5 {
  background-color: rgba(124, 77, 255, 0.1);
  border-radius: 8px;
}

.report-preview {
  min-height: 300px;
}
</style>
