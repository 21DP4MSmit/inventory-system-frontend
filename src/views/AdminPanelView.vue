<template>
  <v-container>
    <v-card elevation="2">
      <data-table
        title="Manage Users"
        :headers="headers"
        :items="users"
        @add="openAddUserDialog"
        @edit="editUser"
        @delete="deleteUser"
      />

      <form-dialog
        v-model="dialog"
        :title="isEditing ? 'Edit User' : 'Add User'"
        :loading="loading"
        submit-button-text="Save"
        @submit="validateAndSubmit"
        @cancel="closeDialog"
      >
        <v-text-field
          v-model="formData.username"
          label="Username"
          :rules="[(v) => !!v || 'Username is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.username"
        ></v-text-field>

        <v-select
          v-model="formData.role"
          :items="['admin', 'staff']"
          label="Role"
          :rules="[(v) => !!v || 'Role is required']"
          required
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.role"
        ></v-select>

        <v-text-field
          v-model="formData.password"
          label="Password"
          type="password"
          :rules="[
            isEditing ? () => true : (v) => !!v || 'Password is required',
          ]"
          :required="!isEditing"
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :error-messages="errors.password"
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
const users = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const errors = reactive({
  username: "",
  role: "",
  password: "",
});

const formData = reactive({
  user_id: null,
  username: "",
  role: "staff",
  password: "",
});

const headers = [
  { title: "Username", key: "username", width: "40%" },
  { title: "Role", key: "role", width: "40%" },
  { title: "Actions", key: "actions", width: "20%", sortable: false },
];

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    notificationStore.error("Failed to load users");
  } finally {
    loading.value = false;
  }
};

const openAddUserDialog = () => {
  isEditing.value = false;
  formData.user_id = null;
  formData.username = "";
  formData.role = "staff";
  formData.password = "";
  clearErrors();
  dialog.value = true;
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const resetForm = () => {
  formData.user_id = null;
  formData.username = "";
  formData.role = "staff";
  formData.password = "";
  clearErrors();
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const editUser = (user) => {
  isEditing.value = true;
  Object.assign(formData, user);
  formData.password = "";
  clearErrors();
  dialog.value = true;
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!formData.username.trim()) {
    errors.username = "Username is required";
    isValid = false;
  } else if (formData.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
    isValid = false;
  }

  if (!formData.role) {
    errors.role = "Role is required";
    isValid = false;
  }

  if (!isEditing.value && !formData.password) {
    errors.password = "Password is required for new users";
    isValid = false;
  } else if (formData.password && formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
    isValid = false;
  }

  return isValid;
};

const validateAndSubmit = async () => {
  if (validateForm()) {
    if (isEditing.value) {
      await updateUser();
    } else {
      await addUser();
    }
  }
};

const addUser = async () => {
  try {
    loading.value = true;
    await api.post("/users", formData);
    dialog.value = false;
    await fetchUsers();
    notificationStore.success("User added successfully");
  } catch (error) {
    console.error("Error adding user:", error);
    notificationStore.error(
      "Error adding user: " + (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const updateUser = async () => {
  try {
    loading.value = true;
    const userData = { ...formData };
    if (!userData.password) {
      delete userData.password;
    }

    await api.put(`/users/${formData.user_id}`, userData);
    dialog.value = false;
    await fetchUsers();
    notificationStore.success("User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    notificationStore.error(
      "Error updating user: " + (error.response?.data?.error || "Unknown error")
    );
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    }
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (user) => {
  try {
    loading.value = true;
    await api.delete(`/users/${user.user_id}`);
    await fetchUsers();
    notificationStore.success("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    notificationStore.error(
      "Error deleting user: " + (error.response?.data?.error || "Unknown error")
    );
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>
