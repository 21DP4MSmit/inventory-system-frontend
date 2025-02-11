<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    class="elevation-0"
  >
    <template v-slot:top>
      <v-toolbar flat class="border-b">
        <v-toolbar-title class="text-subtitle-1 font-weight-medium">
          {{ title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          v-if="showAddButton"
          :color="addButtonColor"
          @click="$emit('add')"
          prepend-icon="mdi-plus"
          class="text-none"
        >
          {{ addButtonText }}
        </v-btn>
      </v-toolbar>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn
        v-if="showEditButton"
        icon="mdi-pencil"
        variant="text"
        :color="editButtonColor"
        size="small"
        class="mr-2"
        @click="$emit('edit', item)"
      ></v-btn>
      <v-btn
        v-if="showDeleteButton"
        icon="mdi-delete"
        variant="text"
        :color="deleteButtonColor"
        size="small"
        @click="$emit('delete', item)"
      ></v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
  addButtonText: {
    type: String,
    default: "Add",
  },
  addButtonColor: {
    type: String,
    default: "primary",
  },
  showEditButton: {
    type: Boolean,
    default: true,
  },
  editButtonColor: {
    type: String,
    default: "primary",
  },
  showDeleteButton: {
    type: Boolean,
    default: true,
  },
  deleteButtonColor: {
    type: String,
    default: "error",
  },
});
</script>
