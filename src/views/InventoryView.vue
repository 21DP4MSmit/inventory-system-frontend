<template>
  <v-container>
    <v-card elevation="2">
      <data-table
        title="Manage Inventory"
        :headers="headers"
        :items="items"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="deleteItem"
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

      <form-dialog
        v-model="dialog"
        :title="isEditing ? 'Edit Item' : 'Add Item'"
        :loading="loading"
        submit-button-text="Save"
        @submit="validateAndSubmit"
        @cancel="closeDialog"
      >
        <v-text-field
          v-model="formData.name"
          label="Item Name"
          :rules="[(v) => !!v || 'Item name is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.name"
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
        ></v-text-field>
      </form-dialog>
    </v-card>
  </v-container>
</template>

<script setup>
import DataTable from "../components/DataTable.vue";
import FormDialog from "../components/FormDialog.vue";
import { ref, reactive, onMounted } from "vue";
import { useNotificationStore } from "../stores/notification";
import api from "../api.js";

const notificationStore = useNotificationStore();
const items = ref([]);
const categories = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const errors = reactive({
  name: "",
  category_id: "",
  quantity: "",
});

const formData = reactive({
  item_id: null,
  name: "",
  category_id: null,
  quantity: null,
});

const headers = [
  { title: "", key: "image", width: "5%", sortable: false },
  { title: "Item Name", key: "name", width: "35%" },
  { title: "Category", key: "category_id", width: "25%" },
  { title: "Quantity", key: "quantity", width: "20%" },
  { title: "Actions", key: "actions", width: "15%", sortable: false },
];

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

const openAddDialog = () => {
  isEditing.value = false;
  formData.item_id = null;
  formData.name = "";
  formData.category_id = null;
  formData.quantity = null;
  clearErrors();
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  Object.assign(formData, item);
  clearErrors();
  dialog.value = true;
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const resetForm = () => {
  formData.item_id = null;
  formData.name = "";
  formData.category_id = null;
  formData.quantity = null;
  clearErrors();
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!formData.name.trim()) {
    errors.name = "Item name is required";
    isValid = false;
  } else if (formData.name.length < 3) {
    errors.name = "Item name must be at least 3 characters";
    isValid = false;
  }

  if (!formData.category_id) {
    errors.category_id = "Category is required";
    isValid = false;
  }

  if (formData.quantity === null || formData.quantity === "") {
    errors.quantity = "Quantity is required";
    isValid = false;
  } else if (isNaN(formData.quantity) || formData.quantity < 0) {
    errors.quantity = "Quantity must be a positive number";
    isValid = false;
  }

  return isValid;
};

const validateAndSubmit = async () => {
  if (validateForm()) {
    if (isEditing.value) {
      await updateItem();
    } else {
      await addItem();
    }
  }
};

const addItem = async () => {
  try {
    loading.value = true;
    await api.post("/items", formData);
    dialog.value = false;
    await fetchItems();
    notificationStore.success("Item added successfully");
  } catch (error) {
    console.error("Error adding item:", error);
    notificationStore.error(
      "Error adding item: " + (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const updateItem = async () => {
  try {
    loading.value = true;

    if (isEditing.value) {
      const originalItem = items.value.find(
        (item) => item.item_id === formData.item_id
      );

      if (originalItem) {
        const quantityChange = formData.quantity - originalItem.quantity;

        if (quantityChange !== 0) {
          const transactionType = quantityChange > 0 ? "in" : "out";
          const absoluteChange = Math.abs(quantityChange);

          try {
            await api.post("/transactions", {
              item_id: formData.item_id,
              transaction_type: transactionType,
              quantity_change: absoluteChange,
              notes: "Quantity adjusted via inventory edit",
            });
          } catch (transactionError) {
            console.error("Error creating transaction:", transactionError);
            notificationStore.error(
              "Error recording transaction, but item will be updated"
            );
          }
        }
      }

      await api.put(`/items/${formData.item_id}`, formData);
    } else {
      await api.post("/items", formData);
    }

    dialog.value = false;
    await fetchItems();
    notificationStore.success(
      isEditing.value ? "Item updated successfully" : "Item added successfully"
    );
  } catch (error) {
    console.error(
      `Error ${isEditing.value ? "updating" : "adding"} item:`,
      error
    );
    notificationStore.error(
      `Error ${isEditing.value ? "updating" : "adding"} item: ` +
        (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const deleteItem = async (item) => {
  try {
    loading.value = true;
    await api.delete(`/items/${item.item_id}`);
    await fetchItems();
    notificationStore.success("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
    notificationStore.error(
      "Error deleting item: " + (error.response?.data?.error || "Unknown error")
    );
  } finally {
    loading.value = false;
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

onMounted(async () => {
  await fetchItems();
  await fetchCategories();
});
</script>
