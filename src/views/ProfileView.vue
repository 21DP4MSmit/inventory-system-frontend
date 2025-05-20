<template>
  <v-container class="py-6">
    <v-row>
      <!-- Profile Header Card -->
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
              <h2 class="text-h5 font-weight-bold mb-4">Account Information</h2>

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

              <div class="d-flex mb-3">
                <div class="info-label">Account ID:</div>
                <div class="info-value">{{ userInfo?.id }}</div>
              </div>

              <div class="d-flex mb-5">
                <div class="info-label">Last Login:</div>
                <div class="info-value">{{ formatDate(lastLogin) }}</div>
              </div>

              <div class="d-flex mt-2">
                <v-btn
                  color="primary"
                  class="text-none"
                  prepend-icon="mdi-lock"
                  @click="openChangePasswordDialog"
                >
                  Change Password
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Activity and Statistics Cards -->
    <v-row class="mt-6">
      <!-- Recent Activity Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" height="100%">
          <v-card-title
            class="py-4 px-6 bg-background-light d-flex align-center"
          >
            <v-icon size="24" class="mr-2">mdi-history</v-icon>
            <span class="text-h5">Recent Activity</span>
          </v-card-title>

          <v-card-text class="pa-4" v-if="loading">
            <div class="d-flex justify-center py-4">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </v-card-text>

          <v-card-text v-else-if="recentActivity.length > 0" class="pa-0">
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(activity, index) in recentActivity"
                :key="index"
                :dot-color="getActivityColor(activity.type)"
                size="small"
              >
                <template v-slot:opposite></template>
                <div class="timeline-content">
                  <div class="d-flex justify-space-between mb-1">
                    <strong>{{ activity.description }}</strong>
                    <span class="text-caption">{{
                      formatDate(activity.date)
                    }}</span>
                  </div>
                  <div class="text-caption">{{ activity.details }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>

          <v-card-text v-else class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-3"
              >mdi-clock-outline</v-icon
            >
            <p>No recent activity found</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Statistics Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" height="100%">
          <v-card-title
            class="py-4 px-6 bg-background-light d-flex align-center"
          >
            <v-icon size="24" class="mr-2">mdi-chart-box</v-icon>
            <span class="text-h5">Your Statistics</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="stat-card">
                  <v-icon size="36" color="primary" class="mb-2"
                    >mdi-package-variant-plus</v-icon
                  >
                  <h3 class="text-h4 font-weight-bold mb-1">
                    {{ userStats.stockInCount }}
                  </h3>
                  <p class="text-subtitle-2">Stock Ins</p>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="stat-card">
                  <v-icon size="36" color="error" class="mb-2"
                    >mdi-package-variant-minus</v-icon
                  >
                  <h3 class="text-h4 font-weight-bold mb-1">
                    {{ userStats.stockOutCount }}
                  </h3>
                  <p class="text-subtitle-2">Stock Outs</p>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="stat-card">
                  <v-icon size="36" color="success" class="mb-2"
                    >mdi-clock-time-four</v-icon
                  >
                  <h3 class="text-h4 font-weight-bold mb-1">
                    {{ userStats.recentTransactions }}
                  </h3>
                  <p class="text-subtitle-2">Transactions This Month</p>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="stat-card">
                  <v-icon size="36" color="info" class="mb-2"
                    >mdi-calendar-month</v-icon
                  >
                  <h3 class="text-h4 font-weight-bold mb-1">
                    {{ userStats.daysSinceLastLogin }}
                  </h3>
                  <p class="text-subtitle-2">Days Since First Login</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
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
import { ref, reactive, onMounted, computed } from "vue";
import { useUserStore } from "../stores/user";
import { useNotificationStore } from "../stores/notification";
import FormDialog from "../components/FormDialog.vue";
import api from "../api";

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const loading = ref(true);
const formLoading = ref(false);
const formError = ref("");
const passwordDialog = ref(false);
const lastLogin = ref(new Date().toISOString());
const recentActivity = ref([]);

const userInfo = computed(() => userStore.getUserInfo);

const userStats = reactive({
  stockInCount: 0,
  stockOutCount: 0,
  recentTransactions: 0,
  daysSinceLastLogin: 0,
});

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

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActivityColor = (type) => {
  const colors = {
    login: "info",
    transaction: "success",
    inventory: "primary",
    password: "warning",
    error: "error",
  };

  return colors[type] || "grey";
};

const fetchUserActivity = async () => {
  try {
    loading.value = true;

    const response = await api.get("/transactions");
    const transactions = response.data.filter(
      (t) => t.user_id === userInfo.value?.id
    );

    userStats.stockInCount = transactions.filter(
      (t) => t.transaction_type === "in"
    ).length;
    userStats.stockOutCount = transactions.filter(
      (t) => t.transaction_type === "out"
    ).length;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    userStats.recentTransactions = transactions.filter(
      (t) => new Date(t.transaction_date) >= firstDayOfMonth
    ).length;

    const activities = transactions.slice(0, 10).map((t) => ({
      type: "transaction",
      description: t.transaction_type === "in" ? "Stock In" : "Stock Out",
      date: t.transaction_date,
      details: `${t.quantity_change} units of "${t.item_name}"`,
    }));

    activities.unshift({
      type: "login",
      description: "Logged In",
      date: new Date().toISOString(),
      details: "Current session",
    });

    recentActivity.value = activities.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const oldestActivity = transactions.reduce((oldest, current) => {
      return new Date(current.transaction_date) <
        new Date(oldest.transaction_date)
        ? current
        : oldest;
    }, transactions[0] || { transaction_date: new Date().toISOString() });

    const firstDate = new Date(oldestActivity.transaction_date);
    const dayDiff = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));
    userStats.daysSinceLastLogin = dayDiff;
  } catch (error) {
    console.error("Error fetching user activity:", error);
    notificationStore.error("Failed to load activity data");
  } finally {
    loading.value = false;
  }
};

const openChangePasswordDialog = () => {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  formError.value = "";
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
  passwordDialog.value = true;
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await api.put(`/users/${userInfo.value.id}/password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    passwordDialog.value = false;
    notificationStore.success("Password has been updated successfully");

    recentActivity.value.unshift({
      type: "password",
      description: "Password Changed",
      date: new Date().toISOString(),
      details: "You changed your account password",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    if (!error.response) {
      formError.value =
        "Network error. This might be due to CORS restrictions. Please try again later.";
    } else {
      formError.value =
        error.response?.data?.error ||
        "Failed to update password. Please try again.";
    }
  } finally {
    formLoading.value = false;
  }
};

onMounted(async () => {
  await fetchUserActivity();
});
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

.stat-card {
  text-align: center;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.08);
}

.timeline-content {
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}
</style>
