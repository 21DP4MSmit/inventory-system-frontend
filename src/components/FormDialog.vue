<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500px"
    persistent
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="bg-primary text-white py-4">
        <span class="text-h5">{{ title }}</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <slot></slot>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="$emit('cancel')"
          class="mr-2"
        >
          Cancel
        </v-btn>
        <v-btn :loading="loading" color="primary" @click="$emit('submit')">
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
  loading: {
    type: Boolean,
    default: false,
  },
  submitButtonText: {
    type: String,
    default: "Submit",
  },
});

defineEmits(["update:modelValue", "submit", "cancel"]);
</script>
