<template>
  <div class="responsive-data-table">
    <!-- Mobile Card View -->
    <div v-if="isMobileView" class="mobile-card-view">
      <v-card
        v-for="(item, index) in items"
        :key="index"
        class="mb-4 mobile-data-card"
        elevation="1"
        :class="{ 'selected-card': isItemSelected(item) }"
      >
        <div class="d-flex align-center px-4 py-3 card-header">
          <v-checkbox
            v-if="showSelection"
            :model-value="isItemSelected(item)"
            @update:model-value="toggleItemSelection(item)"
            density="compact"
            hide-details
          ></v-checkbox>

          <!-- Show primary field as card title -->
          <span class="text-subtitle-1 font-weight-bold">
            {{ getPrimaryField(item) }}
          </span>

          <v-spacer></v-spacer>

          <!-- Actions buttons -->
          <div v-if="showActions">
            <v-btn
              v-if="showEditButton"
              icon="mdi-pencil"
              variant="text"
              :color="editButtonColor"
              size="small"
              class="mr-1"
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
          </div>
        </div>

        <v-divider></v-divider>

        <!-- Item details as list -->
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="header in mobileVisibleHeaders"
            :key="header.key"
            class="px-4"
          >
            <template v-slot:prepend>
              <span class="text-caption text-medium-emphasis"
                >{{ header.title }}:</span
              >
            </template>
            <v-list-item-title class="text-body-2">
              <slot
                v-if="$slots[`item.${header.key}`]"
                :name="`item.${header.key}`"
                :item="item"
              ></slot>
              <span v-else>{{ item[header.key] }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- Empty state -->
      <slot v-if="items.length === 0" name="no-data">
        <div class="pa-6 text-center">
          <v-icon size="48" color="grey-lighten-1" class="mb-3">
            {{ noDataIcon }}
          </v-icon>
          <p>{{ noDataText }}</p>
        </div>
      </slot>
    </div>

    <!-- Desktop Table View -->
    <v-data-table
      v-else
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
        <slot name="table-top">
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
                  @click="$emit('batchDelete', getSelectedItems())"
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
        </slot>
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
                @click="$emit('delete', item)"
              ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>

      <template v-slot:no-data>
        <slot name="no-data">
          <div class="pa-6 text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">
              {{ noDataIcon }}
            </v-icon>
            <p>{{ noDataText }}</p>
          </div>
        </slot>
      </template>
    </v-data-table>

    <v-btn
      v-if="isMobileView && showAddButton"
      color="primary"
      icon="mdi-plus"
      class="floating-add-btn"
      elevation="4"
      size="large"
      @click="$emit('add')"
    ></v-btn>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

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
  showSelection: {
    type: Boolean,
    default: false,
  },
  itemValuePath: {
    type: String,
    default: "item_id",
  },
  primaryField: {
    type: String,
    default: "",
  },
  mobilePriorityFields: {
    type: Array,
    default: () => [],
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  mobileBreakpoint: {
    type: Number,
    default: 768,
  },
});

const emit = defineEmits([
  "add",
  "edit",
  "delete",
  "batchEdit",
  "batchDelete",
  "selectionChange",
]);

const search = ref("");
const selected = ref([]);
const windowWidth = ref(window.innerWidth);
const isMobileView = computed(() => windowWidth.value < props.mobileBreakpoint);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

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

const isItemSelected = (item) => {
  return selected.value.includes(item[props.itemValuePath]);
};

const toggleItemSelection = (item) => {
  const itemId = item[props.itemValuePath];
  const index = selected.value.indexOf(itemId);

  if (index === -1) {
    selected.value.push(itemId);
  } else {
    selected.value.splice(index, 1);
  }
};

const getPrimaryField = (item) => {
  if (props.primaryField) {
    return item[props.primaryField];
  }

  const nameField = Object.keys(item).find((key) =>
    ["name", "title", "label", "id"].includes(key.toLowerCase())
  );

  return nameField ? item[nameField] : `Item ${item[props.itemValuePath]}`;
};

const mobileVisibleHeaders = computed(() => {
  if (props.mobilePriorityFields && props.mobilePriorityFields.length > 0) {
    return props.headers.filter((h) =>
      props.mobilePriorityFields.includes(h.key)
    );
  }

  const filteredHeaders = props.headers.filter(
    (h) =>
      h.key !== "actions" &&
      h.key !== props.primaryField &&
      h.key !== props.itemValuePath
  );

  return filteredHeaders.slice(0, 4);
});
</script>

<style scoped>
.responsive-data-table {
  position: relative;
}

.mobile-card-view {
  padding-bottom: 80px;
}

.mobile-data-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.mobile-data-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
}

.selected-card {
  border: 2px solid var(--primary-color);
}

.floating-add-btn {
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 99;
}

@media (max-width: 600px) {
  .floating-add-btn {
    bottom: 80px;
  }
}

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
