<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    persistent
    @update:modelValue="$emit('update:modelValue', $event)"
    class="form-dialog"
  >
    <v-card>
      <v-card-title :class="`${headerClass} text-white py-4 px-6`">
        <div class="d-flex align-center">
          <v-icon v-if="icon" :icon="icon" class="mr-2" color="white"></v-icon>
          <span class="text-h5">{{ title }}</span>
        </div>
      </v-card-title>

      <v-card-text class="pt-6 px-6">
        <slot></slot>
      </v-card-text>

      <v-card-actions class="pa-6 pt-2">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="$emit('cancel')"
          class="mr-3 text-none"
          :disabled="loading"
        >
          {{ cancelButtonText }}
        </v-btn>
        <v-btn
          :loading="loading"
          :color="submitButtonColor"
          @click="$emit('submit')"
          variant="elevated"
          class="text-none"
        >
          <v-icon
            v-if="submitButtonIcon"
            :icon="submitButtonIcon"
            class="mr-1"
          ></v-icon>
          {{ submitButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitButtonText: {
    type: String,
    default: "Save",
  },
  submitButtonIcon: {
    type: String,
    default: "mdi-check",
  },
  submitButtonColor: {
    type: String,
    default: "primary",
  },
  cancelButtonText: {
    type: String,
    default: "Cancel",
  },
  headerClass: {
    type: String,
    default: "bg-primary",
  },
  maxWidth: {
    type: String,
    default: "500px",
  },
});

defineEmits(["update:modelValue", "submit", "cancel"]);
</script>

<style scoped>
.form-dialog {
  border-radius: var(--card-border-radius);
}

.v-card {
  border-radius: var(--card-border-radius) !important;
  overflow: hidden;
}
</style>
