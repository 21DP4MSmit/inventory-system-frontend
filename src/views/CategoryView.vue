<template>
  <v-container>
    <v-card elevation="2">
      <data-table
        title="Manage Categories"
        :headers="headers"
        :items="categories"
        @add="openAddDialog"
        @edit="openEditDialog"
        @delete="deleteCategory"
      />

      <form-dialog
        v-model="dialog"
        :title="isEditing ? 'Edit Category' : 'Add Category'"
        :loading="loading"
        submit-button-text="Save"
        @submit="validateAndSubmit"
        @cancel="closeDialog"
      >
        <v-text-field
          v-model="formData.category_name"
          label="Category Name"
          :rules="[(v) => !!v || 'Category name is required']"
          required
          variant="outlined"
          density="comfortable"
          :error-messages="errors.category_name"
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
const categories = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const errors = reactive({
  category_name: "",
});

const formData = reactive({
  category_id: null,
  category_name: "",
});

const headers = [
  { title: "Category Name", key: "category_name", width: "85%" },
  { title: "Actions", key: "actions", width: "15%", sortable: false },
];

const fetchCategories = async () => {
  try {
    loading.value = true;
    const response = await api.get("/categories");
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    notificationStore.error("Failed to load categories");
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  formData.category_id = null;
  formData.category_name = "";
  clearErrors();
  dialog.value = true;
};

const openEditDialog = (category) => {
  isEditing.value = true;
  Object.assign(formData, category);
  clearErrors();
  dialog.value = true;
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const resetForm = () => {
  formData.category_id = null;
  formData.category_name = "";
  clearErrors();
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!formData.category_name.trim()) {
    errors.category_name = "Category name is required";
    isValid = false;
  } else if (formData.category_name.length < 2) {
    errors.category_name = "Category name must be at least 2 characters";
    isValid = false;
  }

  return isValid;
};

const validateAndSubmit = async () => {
  if (validateForm()) {
    if (isEditing.value) {
      await updateCategory();
    } else {
      await addCategory();
    }
  }
};

const addCategory = async () => {
  try {
    loading.value = true;
    await api.post("/categories", formData);
    dialog.value = false;
    await fetchCategories();
    notificationStore.success("Category added successfully");
  } catch (error) {
    console.error("Error adding category:", error);
    notificationStore.error(
      "Error adding category: " +
        (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const updateCategory = async () => {
  try {
    loading.value = true;
    await api.put(`/categories/${formData.category_id}`, formData);
    dialog.value = false;
    await fetchCategories();
    notificationStore.success("Category updated successfully");
  } catch (error) {
    console.error("Error updating category:", error);
    notificationStore.error(
      "Error updating category: " +
        (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const deleteCategory = async (category) => {
  try {
    loading.value = true;
    await api.delete(`/categories/${category.category_id}`);
    await fetchCategories();
    notificationStore.success("Category deleted successfully");
  } catch (error) {
    console.error("Error deleting category:", error);
    notificationStore.error(
      "Error deleting category: " +
        (error.response?.data?.error || "Unknown error")
    );
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);
</script>
