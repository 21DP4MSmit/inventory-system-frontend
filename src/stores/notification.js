import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);
  const notificationId = ref(1);

  /**
   * @param {Object} notification
   * @param {string} notification.message
   * @param {string} notification.type
   * @param {number} notification.timeout
   * @returns {number}
   */
  function addNotification({ message, type = "info", timeout = 3000 }) {
    const id = notificationId.value++;

    notifications.value.push({
      id,
      message,
      type,
      timeout,
      timestamp: Date.now(),
    });
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }

    return id;
  }

  /**
   * @param {number} id
   */
  function removeNotification(id) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  /**
   * @param {string} message
   * @param {number} timeout
   * @returns {number}
   */
  function success(message, timeout = 3000) {
    return addNotification({ message, type: "success", timeout });
  }

  /**
   * @param {string} message
   * @param {number} timeout
   * @returns {number}
   */
  function error(message, timeout = 4000) {
    return addNotification({ message, type: "error", timeout });
  }

  /**

   * @param {string} message
   * @param {number} timeout
   * @returns {number}
   */
  function info(message, timeout = 3000) {
    return addNotification({ message, type: "info", timeout });
  }

  /**
   * @param {string} message
   * @param {number} timeout
   * @returns {number}
   */
  function warning(message, timeout = 4000) {
    return addNotification({ message, type: "warning", timeout });
  }

  function clearAll() {
    notifications.value = [];
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
    clearAll,
  };
});
