<template>
  <v-container>
    <v-card elevation="2">
      <data-table
        title="Manage Inventory"
        :headers="headers"
        :items="items"
        item-value-path="item_id"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="deleteItem"
        @batch-delete="batchDeleteItems"
        @batch-edit="openBatchEditDialog"
        @selection-change="handleSelectionChange"
        :loading="loading"
        :show-selection="true"
      >
        <template v-slot:item.image="{ item }">
          <v-avatar v-if="item.image_path" size="40" rounded>
            <v-img :src="item.image_path" :alt="item.name"></v-img>
          </v-avatar>
          <v-avatar v-else size="40" color="grey-darken-3">
            <v-icon>mdi-package-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:item.category_id="{ item }">
          {{ getCategoryName(item.category_id) }}
        </template>

        <template v-slot:item.quantity="{ item }">
          <v-chip
            :color="getQuantityColor(item.quantity)"
            size="small"
            class="font-weight-medium"
          >
            {{ item.quantity }}
          </v-chip>
        </template>
      </data-table>

      <!-- Single Item Form Dialog -->
      <form-dialog
        v-model="dialog"
        :title="isEditing ? 'Edit Item' : 'Add Item'"
        :loading="loading"
        submit-button-text="Save"
        @submit="validateAndSubmit"
        @cancel="closeDialog"
      >
        <v-alert
          v-if="formError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="formError = ''"
        >
          {{ formError }}
        </v-alert>

        <v-text-field
          v-model="formData.name"
          label="Item Name"
          :rules="[(v) => !!v || 'Item name is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.name"
          @input="errors.name = ''"
        ></v-text-field>

        <v-select
          v-model="formData.category_id"
          :items="categories"
          item-title="category_name"
          item-value="category_id"
          label="Select Category"
          :rules="[(v) => !!v || 'Category is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.category_id"
          @update:model-value="errors.category_id = ''"
        ></v-select>

        <v-text-field
          v-model="formData.quantity"
          label="Quantity"
          type="number"
          :rules="[(v) => !!v || 'Quantity is required']"
          required
          variant="outlined"
          density="comfortable"
          :error-messages="errors.quantity"
          @input="errors.quantity = ''"
        ></v-text-field>
      </form-dialog>

      <!-- Batch Edit Dialog -->
      <v-dialog v-model="batchDialog" max-width="600" persistent>
        <v-card>
          <v-card-title class="py-4 px-6 bg-primary text-white">
            <v-icon icon="mdi-pencil-box-multiple" class="mr-2"></v-icon>
            Batch Edit {{ selectedItems.length }} Items
          </v-card-title>

          <v-card-text class="pt-6 px-6">
            <v-alert
              v-if="formError"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="formError = ''"
            >
              {{ formError }}
            </v-alert>

            <p class="mb-4">
              Select the fields you want to update for all selected items:
            </p>

            <v-checkbox
              v-model="batchFields.category"
              label="Update Category"
              hide-details
              class="mb-2"
            ></v-checkbox>

            <div v-if="batchFields.category" class="ml-8 my-2">
              <v-select
                v-model="batchData.category_id"
                :items="categories"
                item-title="category_name"
                item-value="category_id"
                label="Select Category"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                :error-messages="errors.batch_category_id"
                @update:model-value="errors.batch_category_id = ''"
              ></v-select>
            </div>

            <v-checkbox
              v-model="batchFields.quantity"
              label="Update Quantity"
              hide-details
              class="mb-2"
            ></v-checkbox>

            <div v-if="batchFields.quantity" class="ml-8 my-2">
              <v-radio-group
                v-model="batchData.quantityMode"
                class="mt-1"
                inline
                hide-details
              >
                <v-radio label="Set to value" value="set"></v-radio>
                <v-radio label="Add value" value="add"></v-radio>
                <v-radio label="Subtract value" value="subtract"></v-radio>
              </v-radio-group>

              <v-text-field
                v-model="batchData.quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                density="comfortable"
                class="mt-2"
                :error-messages="errors.batch_quantity"
                @input="errors.batch_quantity = ''"
                :hint="
                  batchData.quantityMode === 'set'
                    ? 'Will set the quantity to this value for all selected items'
                    : batchData.quantityMode === 'add'
                    ? 'Will add this amount to each selected item'
                    : 'Will subtract this amount from each selected item'
                "
                persistent-hint
              ></v-text-field>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-2">
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="closeBatchDialog"
              class="mr-3 text-none"
              :disabled="batchLoading"
            >
              Cancel
            </v-btn>
            <v-btn
              :loading="batchLoading"
              color="primary"
              @click="applyBatchEdit"
              variant="elevated"
              class="text-none"
              :disabled="!isBatchEditValid"
            >
              <v-icon icon="mdi-content-save" class="mr-1"></v-icon>
              Apply Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success feedback dialog -->
      <v-dialog v-model="successDialog" max-width="500">
        <v-card>
          <v-card-title class="py-4 px-6 bg-success text-white">
            <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
            Operation Successful
          </v-card-title>
          <v-card-text class="pt-6 px-6">
            <p>{{ successMessage }}</p>
          </v-card-text>
          <v-card-actions class="pa-6 pt-2">
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="successDialog = false"
              class="text-none"
            >
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import DataTable from "../components/DataTable.vue";
import FormDialog from "../components/FormDialog.vue";
import { useNotificationStore } from "../stores/notification";
import { ErrorHandler } from "../utils/errorHandler";
import api from "../api.js";

const notificationStore = useNotificationStore();
const items = ref([]);
const categories = ref([]);
const selectedItems = ref([]);
const selectedIds = ref([]);
const dialog = ref(false);
const batchDialog = ref(false);
const successDialog = ref(false);
const successMessage = ref("");
const isEditing = ref(false);
const loading = ref(false);
const batchLoading = ref(false);
const formError = ref("");

const errors = reactive({
  name: "",
  category_id: "",
  quantity: "",
  batch_category_id: "",
  batch_quantity: "",
});

const formData = reactive({
  item_id: null,
  name: "",
  category_id: null,
  quantity: null,
  image_path: null,
});

const batchFields = reactive({
  category: false,
  quantity: false,
});

const batchData = reactive({
  category_id: null,
  quantity: null,
  quantityMode: "set",
});

const headers = [
  { title: "", key: "image", width: "5%", sortable: false },
  { title: "Item Name", key: "name", width: "35%" },
  { title: "Category", key: "category_id", width: "25%" },
  { title: "Quantity", key: "quantity", width: "20%" },
  { title: "Actions", key: "actions", width: "15%", sortable: false },
];

const isBatchEditValid = computed(() => {
  if (!batchFields.category && !batchFields.quantity) {
    return false;
  }

  if (batchFields.category && !batchData.category_id) {
    return false;
  }

  if (
    batchFields.quantity &&
    (batchData.quantity === null ||
      batchData.quantity === "" ||
      isNaN(Number(batchData.quantity)) ||
      Number(batchData.quantity) < 0)
  ) {
    return false;
  }

  return true;
});

const fetchItems = async () => {
  try {
    loading.value = true;
    const response = await api.get("/items");
    items.value = response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    notificationStore.error("Failed to load inventory items");
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
    notificationStore.error("Failed to load categories");
  }
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find((c) => c.category_id === categoryId);
  return category ? category.category_name : "Unknown Category";
};

const getQuantityColor = (quantity) => {
  if (quantity <= 5) return "error";
  if (quantity <= 20) return "warning";
  return "success";
};

const validateForm = () => {
  const rules = {
    name: [
      ErrorHandler.validators.required("Item name is required"),
      ErrorHandler.validators.minLength(
        3,
        "Item name must be at least 3 characters"
      ),
    ],
    category_id: ErrorHandler.validators.required("Category is required"),
    quantity: [
      ErrorHandler.validators.required("Quantity is required"),
      ErrorHandler.validators.number("Quantity must be a number"),
      ErrorHandler.validators.positiveNumber(
        "Quantity must be a positive number"
      ),
    ],
  };

  return ErrorHandler.validateForm(formData, rules, errors);
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const openAddDialog = () => {
  isEditing.value = false;
  formData.item_id = null;
  formData.name = "";
  formData.category_id = null;
  formData.quantity = null;
  formData.image_path = null;
  clearErrors();
  formError.value = "";
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  formData.item_id = item.item_id;
  formData.name = item.name;
  formData.category_id = item.category_id;
  formData.quantity = item.quantity;
  formData.image_path = item.image_path;
  clearErrors();
  formError.value = "";
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const closeBatchDialog = () => {
  batchDialog.value = false;
  batchFields.category = false;
  batchFields.quantity = false;
  batchData.category_id = null;
  batchData.quantity = null;
  batchData.quantityMode = "set";
  formError.value = "";
  errors.batch_category_id = "";
  errors.batch_quantity = "";
};

const handleSelectionChange = (ids) => {
  selectedIds.value = ids;

  selectedItems.value = items.value.filter((item) =>
    ids.includes(item.item_id)
  );

  console.log(
    `Selected ${selectedItems.value.length} items:`,
    selectedItems.value
  );
};

const validateBatchForm = () => {
  let rules = {};

  if (batchFields.category) {
    rules.batch_category_id = ErrorHandler.validators.required(
      "Category is required"
    );
  }

  if (batchFields.quantity) {
    rules.batch_quantity = [
      ErrorHandler.validators.required("Quantity is required"),
      ErrorHandler.validators.positiveNumber(
        "Quantity must be a positive number"
      ),
    ];
  }

  const batchFormData = {
    batch_category_id: batchData.category_id,
    batch_quantity: batchData.quantity,
  };

  return ErrorHandler.validateForm(batchFormData, rules, errors);
};

const openBatchEditDialog = (itemsToEdit) => {
  if (!itemsToEdit || itemsToEdit.length === 0) {
    notificationStore.info("No items selected");
    return;
  }

  selectedItems.value = itemsToEdit;
  batchDialog.value = true;
};

const validateAndSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;
    formError.value = "";

    if (isEditing.value) {
      await updateItem();
    } else {
      await addItem();
    }
  } catch (error) {
    formError.value = error.response?.data?.error || "An error occurred";
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const addItem = async () => {
  try {
    await api.post("/items", formData);
    dialog.value = false;
    notificationStore.success("Item added successfully");
    fetchItems();

    successMessage.value = `Item "${formData.name}" has been added successfully.`;
    successDialog.value = true;
  } catch (error) {
    const { message, fieldErrors } = ErrorHandler.handleApiError(
      error,
      "Error adding item"
    );

    if (fieldErrors) {
      Object.assign(errors, fieldErrors);
    }

    formError.value = message;
    throw error;
  }
};

const updateItem = async () => {
  try {
    await api.put(`/items/${formData.item_id}`, formData);
    dialog.value = false;
    notificationStore.success("Item updated successfully");
    fetchItems();

    successMessage.value = `Item "${formData.name}" has been updated successfully.`;
    successDialog.value = true;
  } catch (error) {
    console.error("Error updating item:", error);
    notificationStore.error(
      "Error updating item: " + (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
    throw error;
  }
};

const deleteItem = async (item) => {
  try {
    loading.value = true;
    await api.delete(`/items/${item.item_id}`);
    notificationStore.success("Item deleted successfully");
    fetchItems();
  } catch (error) {
    console.error("Error deleting item:", error);
    notificationStore.error(
      "Error deleting item: " + (error.response?.data?.error || "Unknown error")
    );
  } finally {
    loading.value = false;
  }
};

const batchDeleteItems = async (items) => {
  if (!items || items.length === 0) return;

  try {
    batchLoading.value = true;

    const deletePromises = items.map((item) =>
      api.delete(`/items/${item.item_id}`)
    );

    await Promise.all(deletePromises);

    notificationStore.success(`${items.length} items deleted successfully`);
    fetchItems();

    successMessage.value = `${items.length} ${
      items.length === 1 ? "item has" : "items have"
    } been deleted successfully.`;
    successDialog.value = true;
  } catch (error) {
    console.error("Error during batch delete:", error);
    notificationStore.error(
      "Error deleting items: " +
        (error.response?.data?.error || "Some items could not be deleted")
    );
  } finally {
    batchLoading.value = false;
  }
};

const applyBatchEdit = async () => {
  if (!batchFields.category && !batchFields.quantity) {
    formError.value = "Please select at least one field to update";
    return;
  }

  if (!validateBatchForm()) {
    return;
  }

  try {
    batchLoading.value = true;

    const updateResults = {
      success: 0,
      failed: 0,
      failedItems: [],
    };

    for (const item of selectedItems.value) {
      try {
        const updatedData = { ...item };

        if (batchFields.category) {
          updatedData.category_id = batchData.category_id;
        }

        if (batchFields.quantity) {
          const quantityValue = Number(batchData.quantity);

          if (batchData.quantityMode === "set") {
            updatedData.quantity = quantityValue;
          } else if (batchData.quantityMode === "add") {
            updatedData.quantity = Number(item.quantity) + quantityValue;
          } else if (batchData.quantityMode === "subtract") {
            updatedData.quantity = Math.max(
              0,
              Number(item.quantity) - quantityValue
            );
          }
        }

        await api.put(`/items/${item.item_id}`, updatedData);
        updateResults.success++;
      } catch (error) {
        updateResults.failed++;
        updateResults.failedItems.push({
          item: item.name,
          id: item.item_id,
          error: error.response?.data?.error || "Unknown error",
        });
        console.error(
          `Error updating item ${item.name} (ID: ${item.item_id}):`,
          error
        );
      }
    }

    closeBatchDialog();

    await fetchItems();

    if (updateResults.failed === 0) {
      notificationStore.success(
        `${updateResults.success} items updated successfully`
      );
      successMessage.value = `${updateResults.success} ${
        updateResults.success === 1 ? "item has" : "items have"
      } been updated successfully.`;
    } else if (updateResults.success === 0) {
      notificationStore.error(`Failed to update any items`);
      formError.value = "All updates failed. Please try again.";
      return;
    } else {
      notificationStore.warning(
        `Updated ${updateResults.success} items, but ${updateResults.failed} failed`
      );
      successMessage.value = `Updated ${
        updateResults.success
      } items successfully, but ${updateResults.failed} ${
        updateResults.failed === 1 ? "item" : "items"
      } failed to update.`;
    }

    successDialog.value = true;

    selectedItems.value = [];
    selectedIds.value = [];
  } catch (error) {
    const { message } = ErrorHandler.handleApiError(
      error,
      "Error during batch update operation"
    );

    formError.value = message;
    console.error("Unexpected error during batch update:", error);
  } finally {
    batchLoading.value = false;
  }
};

onMounted(async () => {
  await fetchItems();
  await fetchCategories();
});
</script>

<style scoped>
.v-card {
  overflow: hidden;
}
</style>
