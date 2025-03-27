<template>
  <v-container>
    <v-card elevation="2">
      <data-table
        title="Transaction History"
        icon="mdi-history"
        :headers="headers"
        :items="filteredTransactions"
        :loading="loading"
        @add="openAddDialog"
      >
        <template v-slot:item.transaction_type="{ item }">
          <v-chip
            :color="getTypeColor(item.transaction_type)"
            size="small"
            class="font-weight-medium"
          >
            {{ getTypeLabel(item.transaction_type) }}
          </v-chip>
        </template>

        <template v-slot:item.quantity_change="{ item }">
          <span :class="getQuantityClass(item.transaction_type)">
            {{ item.transaction_type === "in" ? "+" : "-"
            }}{{ Math.abs(item.quantity_change) }}
          </span>
        </template>

        <template v-slot:item.transaction_date="{ item }">
          {{ formatDate(item.transaction_date) }}
        </template>

        <template v-slot:item.notes="{ item }">
          <div class="notes-cell">
            {{ item.notes || "—" }}
          </div>
          <v-tooltip v-if="item.notes" activator="parent" location="top">
            {{ item.notes }}
          </v-tooltip>
        </template>
      </data-table>

      <form-dialog
        v-model="dialog"
        title="Record Inventory Transaction"
        :loading="loading"
        submit-button-text="Save"
        @submit="validateAndSubmit"
        @cancel="closeDialog"
      >
        <v-select
          v-model="formData.item_id"
          :items="items"
          item-title="name"
          item-value="item_id"
          label="Select Item"
          :rules="[(v) => !!v || 'Item is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.item_id"
        ></v-select>

        <v-select
          v-model="formData.transaction_type"
          :items="[
            { title: 'Stock In', value: 'in' },
            { title: 'Stock Out', value: 'out' },
          ]"
          item-title="title"
          item-value="value"
          label="Transaction Type"
          :rules="[(v) => !!v || 'Transaction type is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.transaction_type"
        ></v-select>

        <v-text-field
          v-model="formData.quantity_change"
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
          :error-messages="errors.quantity_change"
        ></v-text-field>

        <v-textarea
          v-model="formData.notes"
          label="Notes (optional)"
          variant="outlined"
          density="comfortable"
          rows="3"
          class="mb-2"
        ></v-textarea>
      </form-dialog>
    </v-card>

    <v-card class="mt-4 pa-4" elevation="2">
      <v-card-title class="text-subtitle-1 pb-2">Filters</v-card-title>
      <v-row>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.type"
            :items="[
              { title: 'All', value: null },
              { title: 'Stock In', value: 'in' },
              { title: 'Stock Out', value: 'out' },
            ]"
            item-title="title"
            item-value="value"
            label="Transaction Type"
            variant="outlined"
            density="comfortable"
            @update:model-value="applyFilters"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.item_id"
            :items="items"
            item-title="name"
            item-value="item_id"
            label="Item"
            variant="outlined"
            density="comfortable"
            clearable
            @update:model-value="applyFilters"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="4">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            min-width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-model="filters.dateFormatted"
                label="Date"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
                clearable
                @click:clear="clearDateFilter"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.date"
              @update:model-value="handleDateSelected"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import DataTable from "../components/DataTable.vue";
import FormDialog from "../components/FormDialog.vue";
import { useNotificationStore } from "../stores/notification";
import { useUserStore } from "../stores/user";
import api from "../api.js";

const notificationStore = useNotificationStore();
const userStore = useUserStore();
const transactions = ref([]);
const filteredTransactions = ref([]);
const items = ref([]);
const dialog = ref(false);
const loading = ref(true);
const dateMenu = ref(false);

const filters = reactive({
  type: null,
  item_id: null,
  date: null,
  dateFormatted: null,
});

const errors = reactive({
  item_id: "",
  transaction_type: "",
  quantity_change: "",
});

const formData = reactive({
  item_id: null,
  transaction_type: "in",
  quantity_change: null,
  notes: "",
});

const headers = [
  { title: "ID", key: "transaction_id", width: "10%" },
  { title: "Item", key: "item_name", width: "25%" },
  { title: "Type", key: "transaction_type", width: "15%" },
  { title: "Quantity", key: "quantity_change", width: "10%" },
  { title: "Date", key: "transaction_date", width: "20%" },
  { title: "User", key: "username", width: "20%" },
  { title: "Notes", key: "notes", width: "25%" },
];

const fetchTransactions = async () => {
  try {
    loading.value = true;
    const [transactionsResponse, itemsResponse] = await Promise.all([
      api.get("/transactions"),
      api.get("/items"),
    ]);

    const itemsMap = {};
    itemsResponse.data.forEach((item) => {
      itemsMap[item.item_id] = item;
    });

    const enhancedTransactions = transactionsResponse.data.map(
      (transaction) => {
        const item = itemsMap[transaction.item_id];
        return {
          ...transaction,
          item_name: item ? item.name : `Item #${transaction.item_id}`,
        };
      }
    );

    transactions.value = enhancedTransactions;

    filteredTransactions.value = [...enhancedTransactions];

    items.value = itemsResponse.data;

    if (filters.type || filters.item_id || filters.date) {
      applyFilters();
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    notificationStore.error("Failed to load transaction history");
  } finally {
    loading.value = false;
  }
};

const fetchItems = async () => {
  try {
    const response = await api.get("/items");
    items.value = response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    notificationStore.error("Failed to load items");
  }
};

const getTypeColor = (type) => {
  return type === "in" ? "success" : "error";
};

const getTypeLabel = (type) => {
  return type === "in" ? "Stock In" : "Stock Out";
};

const getQuantityClass = (type) => {
  return type === "in" ? "text-success" : "text-error";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString();
};

const openAddDialog = () => {
  formData.transaction_id = null;
  formData.item_id = null;
  formData.transaction_type = "in";
  formData.quantity_change = null;
  formData.notes = "";
  clearErrors();
  dialog.value = true;
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const closeDialog = () => {
  dialog.value = false;
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!formData.item_id) {
    errors.item_id = "Item is required";
    isValid = false;
  }

  if (!formData.transaction_type) {
    errors.transaction_type = "Transaction type is required";
    isValid = false;
  }

  if (!formData.quantity_change) {
    errors.quantity_change = "Quantity is required";
    isValid = false;
  } else if (formData.quantity_change <= 0) {
    errors.quantity_change = "Quantity must be positive";
    isValid = false;
  }

  return isValid;
};

const validateAndSubmit = async () => {
  if (validateForm()) {
    await addTransaction();
  }
};

const addTransaction = async () => {
  try {
    loading.value = true;

    const payload = {
      item_id: formData.item_id,
      transaction_type: formData.transaction_type,
      quantity_change: formData.quantity_change,
      notes: formData.notes || null,
    };

    await api.post("/transactions", payload);
    dialog.value = false;
    notificationStore.success("Transaction recorded successfully");
    await fetchTransactions();
  } catch (error) {
    console.error("Error adding transaction:", error);
    notificationStore.error(
      "Error recording transaction: " +
        (error.response?.data?.error || "Unknown error")
    );

    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  let filtered = [...transactions.value];

  if (filters.type) {
    filtered = filtered.filter((t) => t.transaction_type === filters.type);
  }

  if (filters.item_id) {
    filtered = filtered.filter((t) => t.item_id === filters.item_id);
  }

  if (filters.date) {
    const filterDate = new Date(filters.date);
    const filterDateStr = filterDate.toISOString().split("T")[0];

    filtered = filtered.filter((t) => {
      const transactionDateStr = new Date(t.transaction_date)
        .toISOString()
        .split("T")[0];
      return transactionDateStr === filterDateStr;
    });
  }

  filteredTransactions.value = filtered;
};

const handleDateSelected = (date) => {
  filters.date = date;
  if (date) {
    const selectedDate = new Date(date);
    filters.dateFormatted = selectedDate.toLocaleDateString();
  }
  dateMenu.value = false;
  applyFilters();
};

const clearDateFilter = () => {
  filters.date = null;
  filters.dateFormatted = null;
  applyFilters();
};

const formatDateYMD = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

watch(
  transactions,
  (newVal) => {
    applyFilters();
  },
  { deep: true }
);

onMounted(async () => {
  await Promise.all([fetchItems(), fetchTransactions()]);
});
</script>

<style scoped>
.text-success {
  color: var(--success-color);
}

.text-error {
  color: var(--error-color);
}

.notes-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
