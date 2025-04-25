<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title class="py-4 px-6 bg-background-light d-flex align-center">
        <v-icon size="24" class="mr-2">mdi-image-search</v-icon>
        <span class="text-h5">AI Item Detection</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="0" border>
              <v-card-text class="text-center">
                <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  accept="image/png, image/jpeg, image/jpg"
                  @change="handleFileChange"
                />

                <div
                  class="upload-area pa-6"
                  @click="triggerFileInput"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                >
                  <v-icon size="64" color="primary" class="mb-4"
                    >mdi-cloud-upload</v-icon
                  >
                  <p class="text-body-1 mb-2">
                    Click or drag image here to upload
                  </p>
                  <p class="text-caption">Supported formats: JPG, PNG</p>
                </div>

                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  max-height="300"
                  contain
                  class="mt-4"
                ></v-img>

                <v-btn
                  color="primary"
                  class="mt-4 text-none"
                  :disabled="!selectedFile || loading"
                  :loading="loading"
                  @click="detectObjects"
                >
                  <v-icon class="mr-1">mdi-magnify</v-icon>
                  Detect Items
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="0" border class="h-100">
              <v-card-title>Detection Results</v-card-title>

              <v-card-text v-if="loading" class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <p class="mt-4">Processing image with AI...</p>
              </v-card-text>

              <v-card-text v-else-if="results">
                <v-img
                  v-if="results.annotated_image"
                  :src="results.annotated_image"
                  max-height="300"
                  contain
                  class="mb-4"
                ></v-img>

                <div
                  v-if="
                    results.category_suggestions &&
                    results.category_suggestions.length
                  "
                >
                  <h3 class="text-subtitle-1 mb-3">
                    Category Suggestions & Actions
                  </h3>

                  <v-list lines="three" class="bg-surface-light mb-4">
                    <template
                      v-for="(
                        suggestion, index
                      ) in results.category_suggestions"
                      :key="`suggestion-${index}`"
                    >
                      <v-list-item class="mb-2">
                        <template v-slot:prepend>
                          <v-icon color="primary"
                            >mdi-check-circle-outline</v-icon
                          >
                        </template>
                        <v-list-item-title>
                          Detected:
                          <strong>{{ suggestion.detected_object }}</strong>
                          (Count: {{ suggestion.count }})
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          Suggested Category:
                          <strong>{{ suggestion.suggested_category }}</strong>
                        </v-list-item-subtitle>

                        <div
                          v-if="
                            suggestion.existing_items_in_category &&
                            suggestion.existing_items_in_category.length
                          "
                          class="mt-3"
                        >
                          <span class="text-caption d-block mb-1"
                            >Existing Items in Category:</span
                          >
                          <div
                            v-for="item in suggestion.existing_items_in_category"
                            :key="`existing-${item.item_id}`"
                            class="d-flex align-center justify-space-between mb-1"
                          >
                            <span class="text-body-2">
                              {{ item.name }} (Qty: {{ item.quantity }})</span
                            >
                            <v-btn
                              size="x-small"
                              color="success"
                              variant="outlined"
                              class="text-none ml-2"
                              :loading="transactionLoading[item.item_id]"
                              @click="
                                addQuantityToItem(
                                  item.item_id,
                                  suggestion.count
                                )
                              "
                            >
                              <v-icon size="16" class="mr-1"
                                >mdi-plus-box</v-icon
                              >
                              Add {{ suggestion.count }}
                            </v-btn>
                          </div>
                        </div>
                        <div v-else class="mt-2 text-caption">
                          No existing items found in this category.
                        </div>

                        <v-divider class="my-2"></v-divider>
                        <v-btn
                          size="small"
                          color="primary"
                          variant="text"
                          class="text-none"
                          @click="openCreateItemDialog(suggestion)"
                        >
                          <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                          Create New Item in '{{
                            suggestion.suggested_category
                          }}'
                        </v-btn>
                      </v-list-item>
                      <v-divider
                        v-if="index < results.category_suggestions.length - 1"
                      ></v-divider>
                    </template>
                  </v-list>
                </div>
                <div v-else class="text-center py-4">
                  <p>No category suggestions available for detected items.</p>
                </div>

                <div
                  v-if="
                    results.unmapped_objects &&
                    results.unmapped_objects.length > 0
                  "
                  class="mt-4"
                >
                  <v-alert type="warning" variant="tonal" density="compact">
                    <template v-slot:prepend>
                      <v-icon>mdi-alert-circle-outline</v-icon>
                    </template>
                    Found unmapped objects:
                    {{ results.unmapped_objects.join(", ") }}.
                    <v-btn
                      size="small"
                      variant="text"
                      color="warning"
                      class="text-none ml-2"
                      @click="
                        showUnmappedObjectsDialog(results.unmapped_objects)
                      "
                      >Map Now</v-btn
                    >
                  </v-alert>
                </div>
              </v-card-text>

              <v-card-text v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-3"
                  >mdi-image-search</v-icon
                >
                <p>Upload an image and click "Detect Items" to see results</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <form-dialog
      v-model="itemDialog"
      :title="newItem.item_id ? 'Update Item' : 'Create Item from Detection'"
      :loading="itemLoading"
      :submit-button-text="newItem.item_id ? 'Update Item' : 'Save Item'"
      @submit="saveNewItem"
      @cancel="closeItemDialog"
    >
      <v-text-field
        v-model="newItem.name"
        label="Item Name"
        :rules="[(v) => !!v || 'Item name is required']"
        required
        variant="outlined"
        density="comfortable"
        class="mb-2"
      ></v-text-field>

      <v-select
        v-model="newItem.category_id"
        :items="categories"
        item-title="category_name"
        item-value="category_id"
        label="Select Category"
        :rules="[(v) => !!v || 'Category is required']"
        required
        variant="outlined"
        density="comfortable"
        class="mb-2"
      ></v-select>

      <v-text-field
        v-model="newItem.quantity"
        label="Quantity"
        type="number"
        :rules="[
          (v) =>
            (v !== null && v !== '' && v >= 0) ||
            'Quantity is required and must be non-negative',
        ]"
        required
        variant="outlined"
        density="comfortable"
      ></v-text-field>
    </form-dialog>

    <form-dialog
      v-model="mappingDialog"
      title="Map Detected Objects to Categories"
      :loading="mappingLoading"
      submit-button-text="Save Mappings"
      @submit="saveObjectMappings"
      @cancel="mappingDialog = false"
    >
      <div v-if="unmappedObjects.length">
        <p class="mb-4">
          These objects were detected but don't have category mappings yet.
          Please assign them to categories:
        </p>

        <div
          v-for="(object, index) in unmappedObjects"
          :key="index"
          class="mb-4"
        >
          <v-select
            v-model="objectMappings[object]"
            :items="categories"
            item-title="category_name"
            item-value="category_id"
            :label="`Category for '${object}'`"
            variant="outlined"
            density="comfortable"
            clearable
          ></v-select>
        </div>
      </div>
      <div v-else>
        <p>No unmapped objects found in the latest detection.</p>
      </div>
    </form-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import FormDialog from "../components/FormDialog.vue";
import { useNotificationStore } from "../stores/notification";
import { useUserStore } from "../stores/user";
import api from "../api.js";

const notificationStore = useNotificationStore();
const userStore = useUserStore();

const hasAIPermission = computed(() =>
  userStore.hasPermission("use_ai_detection")
);

const fileInput = ref(null);
const selectedFile = ref(null);
const imagePreview = ref(null);
const loading = ref(false);
const error = ref(null);
const results = ref(null);

const itemDialog = ref(false);
const itemLoading = ref(false);
const categories = ref([]);
const newItem = reactive({
  item_id: null,
  name: "",
  category_id: null,
  quantity: 1,
  image_path: null,
});

const mappingDialog = ref(false);
const mappingLoading = ref(false);
const unmappedObjects = ref([]);
const objectMappings = reactive({});

const transactionLoading = reactive({});

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  processSelectedFile(file);
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file && file.type.match("image.*")) {
    processSelectedFile(file);
  } else {
    notificationStore.error("Please drop an image file (JPG, PNG).");
  }
}

function processSelectedFile(file) {
  if (file) {
    selectedFile.value = file;
    createImagePreview(file);
    results.value = null;
    error.value = null;
  }
}

function createImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function detectObjects() {
  if (!selectedFile.value) return;
  if (!hasAIPermission.value) {
    notificationStore.error("You do not have permission to use AI detection");
    return;
  }

  loading.value = true;
  error.value = null;
  results.value = null;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const response = await api.post("/detect-objects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Confidence-Threshold": "0.4",
      },
    });

    results.value = response.data;

    if (results.value.success) {
      notificationStore.success("Object detection completed successfully");
      if (
        results.value.unmapped_objects &&
        results.value.unmapped_objects.length > 0
      ) {
        notificationStore.info(
          `Found ${results.value.unmapped_objects.length} unmapped objects. Click 'Map Now' in the results to assign categories.`
        );
      }
    } else {
      error.value =
        results.value.error || "Detection completed but reported an issue.";
      notificationStore.error(error.value);
    }
  } catch (err) {
    error.value = err.response?.data?.error || "Error processing image";
    notificationStore.error(error.value);
  } finally {
    loading.value = false;
  }
}

function showUnmappedObjectsDialog(objects) {
  unmappedObjects.value = objects;
  for (const key in objectMappings) {
    delete objectMappings[key];
  }
  objects.forEach((obj) => {
    objectMappings[obj] = null;
  });

  mappingDialog.value = true;
}

async function saveObjectMappings() {
  mappingLoading.value = true;

  try {
    const mappingsToSave = [];

    for (const [object, categoryId] of Object.entries(objectMappings)) {
      if (categoryId) {
        mappingsToSave.push({
          object_name: object,
          category_id: categoryId,
        });
      }
    }

    if (mappingsToSave.length === 0) {
      notificationStore.info("No mappings selected to save.");
      mappingDialog.value = false;
      mappingLoading.value = false;
      return;
    }

    for (const mapping of mappingsToSave) {
      await api.post("/object-mappings", mapping);
    }

    notificationStore.success(
      `Saved ${mappingsToSave.length} object mappings. Re-detecting to see updated suggestions...`
    );
    mappingDialog.value = false;

    if (mappingsToSave.length > 0) {
      await detectObjects();
    }
  } catch (err) {
    notificationStore.error(
      err.response?.data?.error || "Error saving object mappings"
    );
  } finally {
    mappingLoading.value = false;
  }
}

function openCreateItemDialog(suggestion) {
  resetNewItemForm();
  newItem.name = suggestion.detected_object;
  newItem.category_id = suggestion.category_id;
  newItem.quantity = suggestion.count || 1;

  itemDialog.value = true;
}

async function saveNewItem() {
  if (
    !newItem.name ||
    !newItem.category_id ||
    newItem.quantity === null ||
    newItem.quantity < 0
  ) {
    notificationStore.error(
      "Please fill in Item Name, select a Category, and enter a valid Quantity."
    );
    return;
  }

  itemLoading.value = true;

  try {
    const payload = { ...newItem };
    delete payload.item_id;

    await api.post("/items", payload);
    notificationStore.success(`Item '${newItem.name}' created successfully`);
    itemDialog.value = false;
    resetNewItemForm();
  } catch (err) {
    notificationStore.error(err.response?.data?.error || "Error creating item");
  } finally {
    itemLoading.value = false;
  }
}

async function addQuantityToItem(itemId, quantityToAdd) {
  transactionLoading[itemId] = true;

  try {
    const payload = {
      item_id: itemId,
      transaction_type: "in",
      quantity_change: quantityToAdd,
      notes: "Added via AI detection",
    };
    await api.post("/transactions", payload);
    notificationStore.success(
      `Successfully added ${quantityToAdd} to item ID ${itemId}`
    );
    await detectObjects();
  } catch (err) {
    notificationStore.error(
      err.response?.data?.error || `Error adding quantity to item ID ${itemId}`
    );
  } finally {
    transactionLoading[itemId] = false;
  }
}

function resetNewItemForm() {
  newItem.item_id = null;
  newItem.name = "";
  newItem.category_id = null;
  newItem.quantity = 1;
  newItem.image_path = null;
}

function closeItemDialog() {
  itemDialog.value = false;
  resetNewItemForm();
}

async function fetchCategories() {
  try {
    const response = await api.get("/categories");
    categories.value = response.data;
  } catch (err) {
    notificationStore.error("Failed to load categories");
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.upload-area {
  border: 2px dashed #7c4dff;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-area:hover {
  background-color: rgba(124, 77, 255, 0.05);
}

.h-100 {
  height: 100%;
}

.bg-surface-light {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}
</style>
