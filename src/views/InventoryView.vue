<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-clipboard-list</v-icon>
          Inventory List
        </v-card-title>
  
        <!-- Vuetify Data Table -->
        <v-data-table
          :headers="headers"
          :items="items"
          class="elevation-2"
          item-value="item_id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Manage Inventory</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openAddDialog">
                <v-icon left>mdi-plus</v-icon>
                Add Item
              </v-btn>
            </v-toolbar>
          </template>
  
          <!-- Action Buttons -->
          <template v-slot:item.actions="{ item }">
            <v-btn icon color="blue" @click="openEditDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteItem(item.item_id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Add/Edit Item Dialog -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? "Edit Item" : "Add Item" }}</span>
          </v-card-title>
  
          <v-card-text>
            <v-text-field v-model="form.name" label="Item Name" required></v-text-field>
            <v-select
            v-model="form.category_id"
            :items="categories"
            item-title="category_name"
            item-value="category_id"
            label="Select Category"
            required
            ></v-select>
            <v-text-field v-model="form.quantity" label="Quantity" type="number" required></v-text-field>
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="green" @click="isEditing ? updateItem() : addItem()">
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
          { title: "Item Name", key: "name" },
          { title: "Category ID", key: "category_id" },
          { title: "Quantity", key: "quantity" },
          { title: "Actions", key: "actions", sortable: false },
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
  