<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title class="py-4 bg-gradient">
        <span class="text-h5">
          <v-icon class="mr-2">mdi-clipboard-list</v-icon>
          Inventory List
        </span>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:top>
          <v-toolbar flat class="border-b">
            <v-toolbar-title class="text-subtitle-1 font-weight-medium">
              Manage Inventory
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              v-if="userStore.isAdmin || userStore.getUserInfo?.role === 'staff'"
              color="primary"
              @click="openAddDialog"
              prepend-icon="mdi-plus"
              class="text-none"
            >
              Add Item
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="userStore.isAdmin || userStore.getUserInfo?.role === 'staff'"
            icon="mdi-pencil"
            variant="text"
            color="primary"
            size="small"
            class="mr-2"
            @click="openEditDialog(item)"
          ></v-btn>
          <v-btn
            v-if="userStore.isAdmin || userStore.getUserInfo?.role === 'staff'"
            icon="mdi-delete"
            variant="text"
            color="error"
            size="small"
            @click="deleteItem(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white py-4">
          <span class="text-h5">{{ isEditing ? "Edit Item" : "Add Item" }}</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="formRef" @submit.prevent>
            <v-text-field
              v-model="formData.name"
              label="Item Name"
              :rules="[v => !!v || 'Item name is required']"
              required
              variant="outlined"
              density="comfortable"
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="formData.category_id"
              :items="categories"
              item-title="category_name"
              item-value="category_id"
              label="Select Category"
              :rules="[v => !!v || 'Category is required']"
              required
              variant="outlined"
              density="comfortable"
              class="mb-2"
            ></v-select>

            <v-text-field
              v-model="formData.quantity"
              label="Quantity"
              type="number"
              :rules="[v => !!v || 'Quantity is required']"
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
          <v-btn
            color="primary"
            @click="validateAndSubmit"
            :loading="loading"
          >
            {{ isEditing ? "Save Changes" : "Add Item" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import api from '../api.js';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);

// State
const items = ref([]);
const categories = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const formData = reactive({
  item_id: null,
  name: '',
  category_id: null,
  quantity: null,
});

// Constants
const headers = [
  { title: 'Item Name', key: 'name', width: '40%' },
  { title: 'Category', key: 'category_id', width: '25%' },
  { title: 'Quantity', key: 'quantity', width: '20%' },
  { title: 'Actions', key: 'actions', width: '15%', sortable: false },
];

const resetForm = () => {
  formData.item_id = null;
  formData.name = '';
  formData.category_id = null;
  formData.quantity = null;
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

// Methods
const fetchItems = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await api.get('/items', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    if (error.response?.status === 401) {
      userStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await api.get('/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error.response?.status === 401) {
      userStore.logout();
      router.push('/login');
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
  Object.assign(formData, {
    item_id: item.item_id,
    name: item.name,
    category_id: item.category_id,
    quantity: item.quantity
  });
  dialog.value = true;
};

const validateAndSubmit = async () => {
  const { valid } = await formRef.value?.validate() || { valid: false };
  if (valid) {
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
    const token = localStorage.getItem('token');
    const requestData = {
      name: formData.name,
      category_id: Number(formData.category_id),
      quantity: Number(formData.quantity),
    };

    await api.post('/items', requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    closeDialog();
    await fetchItems();
  } catch (error) {
    console.error('Error adding item:', error.response?.data || error);
  } finally {
    loading.value = false;
  }
};

const updateItem = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const requestData = {
      name: formData.name,
      category_id: Number(formData.category_id),
      quantity: Number(formData.quantity),
    };

    await api.put(`/items/${formData.item_id}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    closeDialog();
    await fetchItems();
  } catch (error) {
    console.error('Error updating item:', error);
  } finally {
    loading.value = false;
  }
};

const deleteItem = async (item) => {
  if (!item?.item_id) return;
  
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    await api.delete(`/items/${item.item_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    items.value = items.value.filter((i) => i.item_id !== item.item_id);
  } catch (error) {
    console.error('Error deleting item:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchItems();
  await fetchCategories();
});
</script>