<template>
  <div class="data-table-wrapper">
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="items"
      :items-per-page="itemsPerPage"
      :search="search"
      :loading="loading"
      :loading-text="loadingText"
      :show-select="showSelection"
      :item-value="itemValuePath"
      class="elevation-0 rounded-table"
      density="comfortable"
    >
      <template v-slot:top>
        <v-toolbar flat class="border-b px-4 table-toolbar">
          <v-toolbar-title
            class="text-subtitle-1 font-weight-medium d-flex align-center"
          >
            <v-icon v-if="icon" :icon="icon" class="mr-2" size="20"></v-icon>
            {{ title }}
            <v-chip
              v-if="items && items.length"
              size="small"
              color="primary"
              variant="tonal"
              class="ml-2"
            >
              {{ items.length }}
            </v-chip>
          </v-toolbar-title>

          <!-- Batch actions toolbar -->
          <v-slide-x-transition>
            <div
              v-if="showSelection && selected.length > 0"
              class="d-flex align-center ml-4"
            >
              <v-chip color="primary" size="small" class="mr-3">
                {{ selected.length }} selected
              </v-chip>

              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                class="mr-2 text-none"
                @click="$emit('batchEdit', getSelectedItems())"
              >
                <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                Edit
              </v-btn>

              <v-btn
                color="error"
                variant="tonal"
                size="small"
                class="mr-2 text-none"
                @click="confirmBatchDelete"
              >
                <v-icon size="small" class="mr-1">mdi-delete</v-icon>
                Delete
              </v-btn>

              <v-btn
                color="grey"
                variant="text"
                size="small"
                class="text-none"
                @click="selected = []"
              >
                Clear
              </v-btn>
            </div>
          </v-slide-x-transition>

          <v-spacer></v-spacer>

          <v-text-field
            v-if="showSearch"
            v-model="search"
            append-inner-icon="mdi-magnify"
            label="Search"
            hide-details
            density="compact"
            variant="outlined"
            class="search-field mx-2"
            style="max-width: 250px"
          ></v-text-field>

          <v-btn
            v-if="showAddButton"
            :color="addButtonColor"
            @click="$emit('add')"
            class="text-none ml-2"
            variant="elevated"
            density="comfortable"
          >
            <v-icon class="mr-1" icon="mdi-plus"></v-icon>
            {{ addButtonText }}
          </v-btn>
        </v-toolbar>
      </template>

      <template
        v-for="slotName in Object.keys($slots)"
        :key="slotName"
        v-slot:[slotName]="slotData"
      >
        <slot :name="slotName" v-bind="slotData"></slot>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-tooltip location="top" text="Edit">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="showEditButton"
                v-bind="props"
                icon="mdi-pencil"
                variant="text"
                :color="editButtonColor"
                size="small"
                class="mr-1"
                @click="$emit('edit', item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Delete">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="showDeleteButton"
                v-bind="props"
                icon="mdi-delete"
                variant="text"
                :color="deleteButtonColor"
                size="small"
                @click="confirmDelete(item)"
              ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>

      <template v-slot:no-data>
        <div class="pa-6 text-center">
          <v-icon size="48" color="grey-lighten-1" class="mb-3">{{
            noDataIcon
          }}</v-icon>
          <p>{{ noDataText }}</p>
        </div>
      </template>
    </v-data-table>

    <!-- Single Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white py-4">
          Confirm Delete
        </v-card-title>
        <v-card-text class="pt-4">
          <p>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" @click="handleDelete"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Batch Delete Confirmation Dialog -->
    <v-dialog v-model="batchDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white py-4">
          Confirm Batch Delete
        </v-card-title>
        <v-card-text class="pt-4">
          <p>
            Are you sure you want to delete {{ selected.length }} selected
            {{ selected.length === 1 ? "item" : "items" }}? This action cannot
            be undone.
          </p>
          <v-alert
            v-if="selected.length > 5"
            color="warning"
            variant="tonal"
            icon="mdi-alert"
            class="mt-4"
            density="compact"
          >
            You are about to delete a large number of items!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="batchDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" @click="handleBatchDelete">
            Delete {{ selected.length }}
            {{ selected.length === 1 ? "Item" : "Items" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "Loading... Please wait",
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
  addButtonText: {
    type: String,
    default: "Add Item",
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
  noDataText: {
    type: String,
    default: "No data available",
  },
  noDataIcon: {
    type: String,
    default: "mdi-alert-circle-outline",
  },
  serverSidePagination: {
    type: Boolean,
    default: false,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  onPageChange: {
    type: Function,
    default: () => {},
  },
  showSelection: {
    type: Boolean,
    default: false,
  },
  itemValuePath: {
    type: String,
    default: "item_id",
  },
});

const emit = defineEmits([
  "add",
  "edit",
  "delete",
  "batchDelete",
  "batchEdit",
  "pageChange",
  "selectionChange",
]);

const page = ref(1);
const search = ref("");
const deleteDialog = ref(false);
const batchDeleteDialog = ref(false);
const itemToDelete = ref(null);
const selected = ref([]);

watch(selected, (newVal) => {
  emit("selectionChange", newVal);
});

const getSelectedItems = () => {
  const itemMap = {};
  props.items.forEach((item) => {
    itemMap[item[props.itemValuePath]] = item;
  });

  return selected.value.map((id) => itemMap[id]).filter((item) => item);
};

function confirmDelete(item) {
  deleteDialog.value = true;
  itemToDelete.value = item;
}

function handleDelete() {
  emit("delete", itemToDelete.value);
  deleteDialog.value = false;
  itemToDelete.value = null;
}

function confirmBatchDelete() {
  if (selected.value.length === 0) return;
  batchDeleteDialog.value = true;
}

function handleBatchDelete() {
  emit("batchDelete", getSelectedItems());
  batchDeleteDialog.value = false;
  selected.value = [];
}

function handlePageChange(newPage) {
  page.value = newPage;
  if (props.serverSidePagination) {
    emit("pageChange", { page: newPage, itemsPerPage: props.itemsPerPage });
  }
}
</script>

<style scoped>
.data-table-wrapper {
  border-radius: var(--card-border-radius);
  overflow: hidden;
}

.rounded-table {
  border-radius: 0 0 var(--card-border-radius) var(--card-border-radius);
}

.table-toolbar {
  border-radius: var(--card-border-radius) var(--card-border-radius) 0 0;
}

.search-field {
  transition: all 0.3s ease;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 100% !important;
  }
}
</style>
