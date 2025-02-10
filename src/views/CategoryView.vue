<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title class="py-4 bg-gradient">
        <span class="text-h5">
          <v-icon class="mr-2">mdi-tag</v-icon>
          Category Management
        </span>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="categories"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:top>
          <v-toolbar flat class="border-b">
            <v-toolbar-title class="text-subtitle-1 font-weight-medium">
              Manage Categories
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              v-if="isAdmin"
              color="primary"
              @click="openAddDialog"
              prepend-icon="mdi-plus"
              class="text-none"
            >
              Add Category
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="isAdmin"
            icon="mdi-pencil"
            variant="text"
            color="primary"
            size="small"
            class="mr-2"
            @click="openEditDialog(item)"
          ></v-btn>
          <v-btn
            v-if="isAdmin"
            icon="mdi-delete"
            variant="text"
            color="error"
            size="small"
            @click="deleteCategory(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white py-4">
          <span class="text-h5">{{
            isEditing ? "Edit Category" : "Add Category"
          }}</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="formRef" @submit.prevent>
            <v-text-field
              v-model="formData.category_name"
              label="Category Name"
              :rules="[(v) => !!v || 'Category name is required']"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
            class="mr-2"
          >
            Cancel
          </v-btn>
          <v-btn color="primary" @click="validateAndSubmit" :loading="loading">
            {{ isEditing ? "Save Changes" : "Add Category" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import api from "../api.js";

const router = useRouter();
const userStore = useUserStore();

// State
const categories = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const formRef = ref(null);

// Form data using reactive for better nested reactivity
const formData = reactive({
  category_id: null,
  category_name: "",
});

// Constants
const headers = [
  { title: "Category Name", key: "category_name", width: "85%" },
  { title: "Actions", key: "actions", width: "15%", sortable: false },
];

const isAdmin = computed(() => userStore.isAdmin);

// Methods
const resetForm = () => {
  formData.category_id = null;
  formData.category_name = "";
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const fetchCategories = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");
    const response = await api.get("/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    if (error.response?.status === 401) {
      userStore.logout();
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  resetForm();
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  formData.category_id = item.category_id;
  formData.category_name = item.category_name;
  dialog.value = true;
};

const validateAndSubmit = async () => {
  const { valid } = (await formRef.value?.validate()) || { valid: false };
  if (valid) {
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
    const token = localStorage.getItem("token");
    const response = await api.post(
      "/categories",
      {
        category_name: formData.category_name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    await fetchCategories(); // Refresh the list
    closeDialog();
  } catch (error) {
    console.error("Error adding category:", error.response?.data || error);
  } finally {
    loading.value = false;
  }
};

const updateCategory = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");
    await api.put(
      `/categories/${formData.category_id}`,
      {
        category_name: formData.category_name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    await fetchCategories(); // Refresh the list
    closeDialog();
  } catch (error) {
    console.error("Error updating category:", error.response?.data || error);
  } finally {
    loading.value = false;
  }
};

const deleteCategory = async (item) => {
  if (!item?.category_id) return;

  try {
    loading.value = true;
    const token = localStorage.getItem("token");
    await api.delete(`/categories/${item.category_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchCategories(); // Refresh the list
  } catch (error) {
    console.error("Error deleting category:", error.response?.data || error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchCategories();
});
</script>
