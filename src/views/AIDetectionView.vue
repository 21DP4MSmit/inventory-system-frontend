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
                  capture="environment"
                  @change="handleFileChange"
                />

                <!-- Camera View when active -->
                <div v-if="cameraActive" class="camera-container">
                  <div class="waiting-message" v-if="!stream">
                    <v-progress-circular
                      indeterminate
                      color="white"
                      class="mb-2"
                    ></v-progress-circular>
                    <span>Waiting for camera access...</span>
                  </div>
                  <video
                    ref="videoElement"
                    autoplay
                    playsinline
                    class="camera-preview"
                    @loadedmetadata="handleVideoLoaded"
                    @error="handleVideoError"
                  ></video>
                  <div class="camera-instruction" v-if="stream">
                    <span
                      >Position your item in frame and tap the camera button to
                      capture</span
                    >
                  </div>
                  <div class="camera-controls">
                    <v-btn color="error" icon @click="stopCamera">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-btn
                      color="primary"
                      icon
                      @click="capturePhoto"
                      :disabled="!stream"
                    >
                      <v-icon>mdi-camera</v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- Upload Area when no camera active -->
                <div
                  v-else
                  class="upload-area pa-6"
                  @click="handleUploadAreaClick"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                >
                  <v-icon size="64" color="primary" class="mb-4"
                    >mdi-cloud-upload</v-icon
                  >
                  <p class="text-body-1 mb-2">
                    Upload or take a photo of your inventory items
                  </p>
                  <div class="d-flex justify-center flex-wrap">
                    <v-btn
                      color="primary"
                      variant="text"
                      class="mx-2 mt-2"
                      prepend-icon="mdi-upload"
                      @click.stop="triggerFileInput"
                    >
                      Upload Image
                    </v-btn>
                    <v-btn
                      v-if="hasCamera"
                      color="primary"
                      variant="text"
                      class="mx-2 mt-2"
                      prepend-icon="mdi-camera"
                      @click.stop="startCamera"
                    >
                      Take Photo
                    </v-btn>
                  </div>
                </div>

                <v-img
                  v-if="imagePreview && !cameraActive"
                  :src="imagePreview"
                  max-height="300"
                  contain
                  class="mt-4"
                ></v-img>

                <canvas ref="canvasElement" style="display: none"></canvas>

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

              <v-card-text v-else-if="results" class="px-4 py-4">
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
                            class="d-flex align-center justify-space-between flex-wrap mb-1"
                          >
                            <span class="text-body-2 mr-2">
                              {{ item.name }} (Qty: {{ item.quantity }})</span
                            >
                            <v-btn
                              size="x-small"
                              color="success"
                              variant="outlined"
                              class="text-none ml-2 mt-1"
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
                          Create New Item
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
                <p>
                  Upload an image or take a photo and click "Detect Items" to
                  see results
                </p>
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

const videoElement = ref(null);
const canvasElement = ref(null);
const cameraActive = ref(false);
const hasCamera = ref(false);
const stream = ref(null);

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

const checkCameraAvailability = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      hasCamera.value = false;
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera.value = devices.some((device) => device.kind === "videoinput");
    } catch (enumError) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        hasCamera.value = true;
      } catch (e) {
        hasCamera.value = false;
      }
    }
  } catch (err) {
    console.error("Error checking camera availability:", err);
    hasCamera.value = false;
  }
};

function handleUploadAreaClick() {}

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

async function startCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      notificationStore.error(
        "Camera access is not supported in your browser or requires HTTPS"
      );
      return;
    }

    if (cameraActive.value && stream.value) {
      notificationStore.info("Camera is already active");
      return;
    }

    cameraActive.value = true;
    notificationStore.info("Accessing camera...");

    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!videoElement.value) {
      console.error("Video element reference is null after waiting");

      const videoEl = document.querySelector(".camera-preview");
      if (videoEl) {
        videoElement.value = videoEl;
      } else {
        notificationStore.error(
          "Camera initialization failed. Please try a different browser."
        );
        cameraActive.value = false;
        return;
      }
    }

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment",
      },
    };

    try {
      stream.value = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoElement.value) {
        videoElement.value.srcObject = stream.value;
      } else {
        throw new Error("Video element is null when trying to set srcObject");
      }

      setTimeout(() => {
        if (
          videoElement.value &&
          !videoElement.value.srcObject &&
          stream.value
        ) {
          try {
            videoElement.value.srcObject = stream.value;
          } catch (e) {
            console.error("Retry failed:", e);
          }
        }
      }, 300);
    } catch (streamError) {
      console.error("Error getting media stream:", streamError);
      throw streamError;
    }
  } catch (err) {
    console.error("Error accessing camera:", err);
    if (err.name === "NotAllowedError") {
      notificationStore.error(
        "Camera access denied. Please check your browser permissions."
      );
    } else if (err.name === "NotFoundError") {
      notificationStore.error("No camera found on your device.");
    } else if (err.name === "NotReadableError") {
      notificationStore.error(
        "Camera is already in use by another application."
      );
    } else {
      notificationStore.error(
        `Could not access camera: ${err.message || "Unknown error"}`
      );
    }

    stopCamera();
    cameraActive.value = false;
  }
}

function stopCamera() {
  if (stream.value) {
    try {
      stream.value.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (e) {
      console.error("Error stopping camera tracks:", e);
    }
    stream.value = null;
  }

  if (videoElement.value && videoElement.value.srcObject) {
    try {
      videoElement.value.srcObject = null;
    } catch (e) {
      console.error("Error clearing video source:", e);
    }
  }

  cameraActive.value = false;
}

function capturePhoto() {
  if (!videoElement.value || !canvasElement.value) {
    notificationStore.error("Camera components not initialized");
    return;
  }

  try {
    const video = videoElement.value;
    const canvas = canvasElement.value;

    if (!video.videoWidth || !video.videoHeight) {
      const videoRect = video.getBoundingClientRect();
      canvas.width = videoRect.width || 640;
      canvas.height = videoRect.height || 480;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        console.warn("Video not ready for capture, drawing placeholder");
        ctx.fillStyle = "#7c4dff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          "Camera preview not available",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    } catch (drawError) {
      console.error("Error drawing to canvas:", drawError);

      ctx.fillStyle = "#7c4dff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Camera capture failed",
        canvas.width / 2,
        canvas.height / 2
      );
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          notificationStore.error(
            "Failed to capture image. Please try again or use 'Upload Image' instead."
          );
          return;
        }

        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });
        processSelectedFile(file);
        stopCamera();
        notificationStore.success("Photo captured successfully");
      },
      "image/jpeg",
      0.9
    );
  } catch (err) {
    console.error("Error capturing photo:", err);
    notificationStore.error(
      "Failed to capture photo: " +
        (err.message || "Unknown error") +
        ". Try using 'Upload Image' instead."
    );
    stopCamera();
  }
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
    console.error("API Error during object detection:", err);
    if (err.message && err.message.includes("CORS")) {
      error.value =
        "Network error: CORS policy blocked the request. Please check your server configuration.";
    } else {
      error.value = err.response?.data?.error || "Error processing image";
    }
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
  checkCameraAvailability();
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

.camera-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  aspect-ratio: 4/3;
  border: 2px solid var(--primary-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 10px;
}

.camera-controls .v-btn {
  background-color: rgba(0, 0, 0, 0.5);
  width: 56px;
  height: 56px;
}

.camera-controls .v-btn--icon .v-icon {
  font-size: 28px;
}

.bg-surface-light {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

.waiting-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 16px;
  border-radius: 8px;
  z-index: 10;
}

.camera-instruction {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

@media (max-width: 600px) {
  .camera-container {
    aspect-ratio: 1/1;
  }

  .camera-instruction {
    font-size: 12px;
    padding: 6px;
  }

  .v-card-title {
    font-size: 1.25rem !important;
  }

  .v-btn-group {
    flex-wrap: wrap;
  }
}
</style>
