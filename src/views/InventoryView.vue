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
      />

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
import api from "../api.js";

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
  { title: "Item Name", key: "name", width: "40%" },
  { title: "Category", key: "category_id", width: "25%" },
  { title: "Quantity", key: "quantity", width: "20%" },
  { title: "Actions", key: "actions", width: "15%", sortable: false },
];

const fetchItems = async () => {
  try {
    const response = await api.get("/items");
    items.value = response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
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

const validateAndSubmit = async () => {
  if (isEditing.value) {
    await updateItem();
  } else {
    await addItem();
  }
};

const addItem = async () => {
  try {
    loading.value = true;
    await api.post("/items", formData);
    dialog.value = false;
    await fetchItems();
  } catch (error) {
    console.error("Error adding item:", error);
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
    await api.put(`/items/${formData.item_id}`, formData);
    dialog.value = false;
    await fetchItems();
  } catch (error) {
    console.error("Error updating item:", error);
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
  } catch (error) {
    console.error("Error deleting item:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchItems();
  await fetchCategories();
});
</script>
