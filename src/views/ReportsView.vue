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

                <div class="mb-4">
                  <label class="text-body-2 mb-1 d-block">Date Range</label>
                  <div class="d-flex align-center">
                    <div
                      class="date-display border pa-2 rounded mr-2 flex-grow-1"
                      @click="showStartDatePicker = true"
                    >
                      {{ formatDateDisplay(startDate) || "Select start date" }}
                    </div>
                    <span class="px-2">to</span>
                    <div
                      class="date-display border pa-2 rounded ml-2 flex-grow-1"
                      @click="showEndDatePicker = true"
                    >
                      {{ formatDateDisplay(endDate) || "Select end date" }}
                    </div>
                  </div>
                </div>

                <v-dialog v-model="showStartDatePicker" width="auto">
                  <v-card>
                    <v-card-title class="pb-0">Select Start Date</v-card-title>
                    <v-card-text>
                      <v-date-picker
                        v-model="startDate"
                        @update:model-value="showStartDatePicker = false"
                      ></v-date-picker>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        @click="showStartDatePicker = false"
                      >
                        Close
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="showEndDatePicker" width="auto">
                  <v-card>
                    <v-card-title class="pb-0">Select End Date</v-card-title>
                    <v-card-text>
                      <v-date-picker
                        v-model="endDate"
                        @update:model-value="showEndDatePicker = false"
                      ></v-date-picker>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="showEndDatePicker = false">
                        Close
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

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
import { ref, onMounted, computed } from "vue";
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

const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(today.getDate() - 30);

const startDate = ref(thirtyDaysAgo);
const endDate = ref(today);

const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);

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

function formatYYYYMMDD(date) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
  if (!date) return "";

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return "";
  }
}

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
  return `${formatDateDisplay(startDate.value)} - ${formatDateDisplay(
    endDate.value
  )}`;
}

async function generateReport() {
  if (!hasReportsPermission.value) {
    notificationStore.error("You do not have permission to generate reports");
    return;
  }

  if (!startDate.value || !endDate.value) {
    notificationStore.error("Please select both start and end dates");
    return;
  }

  generating.value = true;
  reportData.value = null;

  try {
    const params = {
      reportType: reportType.value,
      startDate: formatYYYYMMDD(startDate.value),
      endDate: formatYYYYMMDD(endDate.value),
    };

    if (reportType.value === "category" && selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }

    if (reportType.value === "transaction" && transactionType.value) {
      params.transactionType = transactionType.value;
    }

    const response = await api.get("/generate-report", { params });
    reportData.value = response.data;

    if (reportData.value?.chartData) {
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
  if (!chartCanvas.value) {
    console.warn("Chart canvas not found");
    return;
  }

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  const chartData = reportData.value.chartData;

  if (!chartData || !chartData.labels || !chartData.datasets) {
    console.warn("Invalid chart data", chartData);
    return;
  }

  try {
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
  } catch (e) {
    console.error("Error creating chart:", e);
    notificationStore.error("Error creating chart visualization");
  }
}

async function downloadReport() {
  if (!reportData.value) return;

  try {
    const params = {
      reportType: reportType.value,
      startDate: formatYYYYMMDD(startDate.value),
      endDate: formatYYYYMMDD(endDate.value),
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

.date-display {
  min-height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  opacity: 0.9;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.05);
}

.date-display:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.border {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.rounded {
  border-radius: 8px;
}
</style>
