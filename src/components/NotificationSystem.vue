<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="getColor(notification.type)"
      :timeout="notification.timeout"
      location="top right"
      class="mb-2"
      elevation="4"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon :icon="getIcon(notification.type)" class="mr-2" />
        {{ notification.message }}
      </div>

      <template v-slot:actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="closeNotification(notification.id)"
          size="small"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { useNotificationStore } from "../stores/notification";
import { storeToRefs } from "pinia";

const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);

/**
 * @param {string} type
 * @returns {string}
 */
const getColor = (type) => {
  const colors = {
    success: "success",
    error: "error",
    info: "info",
    warning: "warning",
  };

  return colors[type] || "primary";
};

/**
 * @param {string} type
 * @returns {string}
 */
const getIcon = (type) => {
  const icons = {
    success: "mdi-check-circle",
    error: "mdi-alert-circle",
    info: "mdi-information",
    warning: "mdi-alert",
  };

  return icons[type] || "mdi-bell";
};

/**
 * @param {number} id
 */
const closeNotification = (id) => {
  notificationStore.removeNotification(id);
};
</script>

<style>
.notification-container {
  position: fixed;
  z-index: 2000;
  pointer-events: none;
}

.notification-container .v-snackbar {
  pointer-events: auto;
}
</style>
