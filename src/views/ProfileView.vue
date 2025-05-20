<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="profile-card overflow-hidden">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="4"
              class="bg-gradient d-flex flex-column align-center justify-center py-8"
            >
              <v-avatar size="120" class="mb-4 avatar-border">
                <v-icon size="80" color="white">mdi-account-circle</v-icon>
              </v-avatar>
              <h2 class="text-h4 text-white font-weight-bold mb-1">
                {{ userInfo?.username || "User" }}
              </h2>
              <v-chip
                color="white"
                text-color="primary"
                size="small"
                class="font-weight-medium text-capitalize"
              >
                {{ userInfo?.role || "Staff" }}
              </v-chip>
            </v-col>
            <v-col
              cols="12"
              md="8"
              class="d-flex flex-column justify-center pa-6"
            >
              <h2 class="text-h5 font-weight-bold mb-6">Account Information</h2>

              <div class="d-flex mb-3">
                <div class="info-label">Username:</div>
                <div class="info-value">{{ userInfo?.username }}</div>
              </div>

              <div class="d-flex mb-3">
                <div class="info-label">Role:</div>
                <div class="info-value text-capitalize">
                  {{ userInfo?.role }}
                </div>
              </div>

              <div class="d-flex mb-6">
                <div class="info-label">Account ID:</div>
                <div class="info-value">{{ userInfo?.id }}</div>
              </div>

              <div class="d-flex">
                <v-btn
                  color="primary"
                  class="text-none mr-3"
                  prepend-icon="mdi-lock"
                  @click="openChangePasswordDialog"
                >
                  Change Password
                </v-btn>

                <v-btn
                  variant="outlined"
                  class="text-none"
                  prepend-icon="mdi-clipboard-list"
                  @click="goToInventory"
                >
                  Manage Inventory
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <form-dialog
      v-model="passwordDialog"
      title="Change Password"
      :loading="formLoading"
      submit-button-text="Update Password"
      @submit="updatePassword"
      @cancel="passwordDialog = false"
    >
      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ formError }}
      </v-alert>

      <v-text-field
        v-model="passwordForm.currentPassword"
        label="Current Password"
        type="password"
        :rules="[(v) => !!v || 'Current password is required']"
        required
        variant="outlined"
        density="comfortable"
        class="mb-3"
        :error-messages="formErrors.currentPassword"
      ></v-text-field>

      <v-text-field
        v-model="passwordForm.newPassword"
        label="New Password"
        type="password"
        :rules="[
          (v) => !!v || 'New password is required',
          (v) => v.length >= 8 || 'Password must be at least 8 characters',
        ]"
        required
        variant="outlined"
        density="comfortable"
        class="mb-3"
        :error-messages="formErrors.newPassword"
      ></v-text-field>

      <v-text-field
        v-model="passwordForm.confirmPassword"
        label="Confirm New Password"
        type="password"
        :rules="[
          (v) => !!v || 'Password confirmation is required',
          (v) => v === passwordForm.newPassword || 'Passwords do not match',
        ]"
        required
        variant="outlined"
        density="comfortable"
        :error-messages="formErrors.confirmPassword"
      ></v-text-field>
    </form-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useNotificationStore } from "../stores/notification";
import FormDialog from "../components/FormDialog.vue";
import api from "../api";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const formLoading = ref(false);
const formError = ref("");
const passwordDialog = ref(false);

const userInfo = computed(() => userStore.getUserInfo);

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formErrors = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const openChangePasswordDialog = () => {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  formError.value = "";
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
  passwordDialog.value = true;
};

const goToInventory = () => {
  router.push("/inventory");
};

const updatePassword = async () => {
  formError.value = "";
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));

  if (!passwordForm.currentPassword) {
    formErrors.currentPassword = "Current password is required";
    return;
  }

  if (!passwordForm.newPassword) {
    formErrors.newPassword = "New password is required";
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    formErrors.newPassword = "Password must be at least 8 characters";
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    formErrors.confirmPassword = "Passwords do not match";
    return;
  }

  try {
    formLoading.value = true;

    const userId = userInfo.value?.id;
    if (!userId) {
      formError.value =
        "User ID is not available. Please reload the page or log in again.";
      return;
    }

    await api.put(`/users/${userId}/password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    passwordDialog.value = false;
    notificationStore.success("Password has been updated successfully");
  } catch (error) {
    console.error("Error updating password:", error);

    if (error.response?.status === 401) {
      formError.value = "Current password is incorrect";
    } else if (error.response?.status === 422) {
      formError.value =
        error.response.data.error || "Password validation failed";
    } else if (!error.response) {
      formError.value = "Network error. Unable to connect to the server.";
    } else {
      formError.value =
        error.response?.data?.error ||
        "Failed to update password. Please try again.";
    }
  } finally {
    formLoading.value = false;
  }
};
</script>

<style scoped>
.profile-card {
  border-radius: 12px;
  overflow: hidden;
}

.bg-gradient {
  background: linear-gradient(
    145deg,
    var(--primary-color),
    var(--accent-color)
  );
}

.avatar-border {
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.info-label {
  width: 120px;
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  flex: 1;
}
</style>
