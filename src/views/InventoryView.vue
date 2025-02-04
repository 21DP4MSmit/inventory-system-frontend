<template>
    <v-container>
      <v-card elevation="2">
        <v-card-title class="py-4 bg-gradient">
          <span class="text-h5">
              <v-icon class="mr-2">mdi-clipboard-list</v-icon>
              Inventory List
          </span>
        </v-card-title>
  
        <v-data-table
          :headers="headers"
          :items="items"
          class="elevation-0"
          item-value="item_id"
        >
          <template v-slot:top>
            <v-toolbar flat class="border-b">
              <v-toolbar-title class="text-subtitle-1 font-weight-medium">
                Manage Inventory
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="openAddDialog"
                prepend-icon="mdi-plus"
                class="text-none"
              >
                Add Item
              </v-btn>
            </v-toolbar>
          </template>

          <!-- Customize how each column is displayed -->
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.name }}</td>
              <td>{{ item.category_id }}</td>
              <td>{{ item.quantity }}</td>
              <td class="text-right">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  class="mr-2"
                  @click="openEditDialog(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="deleteItem(item.item_id)"
                ></v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Add/Edit Dialog -->
      <v-dialog v-model="dialog" max-width="500px" persistent>
        <v-card>
            <v-card-title class="bg-primary text-white py-4">
                <span class="text-h5">{{ isEditing ? "Edit Item" : "Add Item" }}</span>
            </v-card-title>
  
          <v-card-text class="pt-4">
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="form.name"
                label="Item Name"
                required
                variant="outlined"
                density="comfortable"
                class="mb-2"
              ></v-text-field>
              
              <v-select
                v-model="form.category_id"
                :items="categories"
                item-title="category_name"
                item-value="category_id"
                label="Select Category"
                required
                variant="outlined"
                density="comfortable"
                class="mb-2"
              ></v-select>
  
              <v-text-field
                v-model="form.quantity"
                label="Quantity"
                type="number"
                required
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-form>
          </v-card-text>
  
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="dialog = false"
              class="mr-2"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="isEditing ? updateItem() : addItem()"
              :loading="loading"
            >
              {{ isEditing ? "Save Changes" : "Add Item" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
</template>
  
<script>
import api from "../api.js";
  
export default {
    data() {
      return {
        items: [],
        categories: [],
        headers: [
            { title: "Item Name", key: "name", width: "40%" },
            { title: "Category", key: "category_id", width: "25%" },
            { title: "Quantity", key: "quantity", width: "20%" },
            { title: "", key: "actions", width: "15%", sortable: false }
      ],
        dialog: false,
        isEditing: false,
        form: {
        item_id: null,
          name: "",
          category_id: null,
          quantity: null,
        },
    };
},
  
async created() {
    await this.fetchItems();
    await this.fetchCategories();
},
  
methods: {
    async fetchItems() {
        try {
          const response = await api.get("/items");
          this.items = response.data;
        } catch (error) {
          console.error("Error fetching inventory:", error);
        }
    },

    async fetchCategories() {
        try {
        const response = await api.get("/categories");
        this.categories = response.data;
        } catch (error) {
        console.error("Error fetching categories:", error);
        }
    },
  
    openAddDialog() {
        this.isEditing = false;
        this.form = { item_id: null, name: "", category_id: null, quantity: null };
        this.dialog = true;
    },
  
    openEditDialog(item) {
        this.isEditing = true;
        this.form = { ...item };
        this.dialog = true;
    },
  
    async addItem() {
        try {
          const requestData = {
            name: this.form.name,
            category_id: Number(this.form.category_id),
            quantity: Number(this.form.quantity),
            image_path: this.form.image_path || null, // Default to null
          };
  
          const response = await api.post("/items", requestData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          this.items.push(response.data);
          this.dialog = false;
          await this.fetchItems();
        } catch (error) {
          console.error("Error adding item:", error.response?.data || error);
        }
    },
  
    async updateItem() {
        try {
          await api.put(`/items/${this.form.item_id}`, this.form);
          const index = this.items.findIndex((item) => item.item_id === this.form.item_id);
          if (index !== -1) this.items[index] = { ...this.form };
          this.dialog = false;
        } catch (error) {
          console.error("Error updating item:", error);
        }
    },
  
    async deleteItem(item_id) {
        try {
          await api.delete(`/items/${item_id}`);
          this.items = this.items.filter((item) => item.item_id !== item_id);
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      },
    },
};
</script>
  