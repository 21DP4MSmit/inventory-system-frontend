import { useNotificationStore } from "../stores/notification";

export const ErrorHandler = {
  /**
   *
   * @param {Error} error - The error object from API call
   * @param {string} defaultMessage - Default message if specific error can't be determined
   * @returns {Object} - Error information including message and field errors
   */
  handleApiError(error, defaultMessage = "An error occurred") {
    const notificationStore = useNotificationStore();
    let message = defaultMessage;
    let fieldErrors = null;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (data && data.error) {
        message = data.error;
      } else if (data && data.message) {
        message = data.message;
      }

      if (status === 401) {
        message = "Authentication required. Please log in again.";
      } else if (status === 403) {
        message = "You don't have permission to perform this action.";
      } else if (status === 404) {
        message = `Resource not found: ${message}`;
      } else if (status === 422) {
        message = `Validation error: ${message}`;
      }

      if (data && data.errors) {
        fieldErrors = data.errors;
      }
    } else if (error.request) {
      message =
        "No response from server. Please check your network connection.";
    }

    notificationStore.error(message);

    console.error("API Error:", { message, error });

    return { message, fieldErrors };
  },

  /**
   *
   * @param {Object} formData - The form data to validate
   * @param {Object} rules - Validation rules for each field
   * @param {Object} errors - Error object to populate with validation results
   * @returns {boolean} - Whether the form is valid
   */
  validateForm(formData, rules, errors) {
    Object.keys(errors).forEach((key) => {
      errors[key] = "";
    });

    let isValid = true;

    Object.entries(rules).forEach(([field, validators]) => {
      if (!Array.isArray(validators)) {
        validators = [validators];
      }

      for (const validator of validators) {
        const result = validator(formData[field]);
        if (result !== true) {
          errors[field] = result;
          isValid = false;
          break;
        }
      }
    });

    return isValid;
  },

  validators: {
    /**
     * @param {string} message - Custom error message
     * @returns {Function} - Validator function
     */
    required(message = "This field is required") {
      return (value) => {
        return value !== null && value !== undefined && value !== ""
          ? true
          : message;
      };
    },

    /**
     * @param {number} min - Minimum length
     * @param {string} message - Custom error message
     * @returns {Function} - Validator function
     */
    minLength(min, message) {
      return (value) => {
        return !value || String(value).length >= min
          ? true
          : message || `Must be at least ${min} characters`;
      };
    },

    /**
     * @param {string} message - Custom error message
     * @returns {Function} - Validator function
     */
    number(message = "Must be a valid number") {
      return (value) => {
        return value === null || value === "" || !isNaN(Number(value))
          ? true
          : message;
      };
    },

    /**
     * @param {string} message - Custom error message
     * @returns {Function} - Validator function
     */
    positiveNumber(message = "Must be a positive number") {
      return (value) => {
        return value === null ||
          value === "" ||
          (Number(value) >= 0 && !isNaN(Number(value)))
          ? true
          : message;
      };
    },
  },
};
