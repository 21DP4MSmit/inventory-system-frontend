<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-tag</v-icon>
          Category Management
        </v-card-title>
  
        <!-- Categories Data Table -->
        <v-data-table
          :headers="headers"
          :items="categories"
          class="elevation-2"
          item-value="category_id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Manage Categories</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openAddDialog">
                <v-icon left>mdi-plus</v-icon>
                Add Category
              </v-btn>
            </v-toolbar>
          </template>
  
          <!-- Action Buttons -->
          <template v-slot:item.actions="{ item }">
            <v-btn icon color="blue" @click="openEditDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteCategory(item.category_id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Add/Edit Category Dialog -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? "Edit Category" : "Add Category" }}</span>
          </v-card-title>
  
          <v-card-text>
            <v-text-field v-model="form.category_name" label="Category Name" required></v-text-field>
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="green" @click="isEditing ? updateCategory() : addCategory()">
              {{ isEditing ? "Save Changes" : "Add Category" }}
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
        categories: [],
        headers: [
          { title: "Category Name", key: "category_name" },
          { title: "Actions", key: "actions", sortable: false },
        ],
        dialog: false,
        isEditing: false,
        form: {
          category_id: null,
          category_name: "",
        },
      };
},
  
async created() {
      await this.fetchCategories();
},
  
methods: {
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
        this.form = { category_id: null, category_name: "" };
        this.dialog = true;
    },
  
    openEditDialog(item) {
        this.isEditing = true;
        this.form = { ...item };
        this.dialog = true;
    },
  
    async addCategory() {
        try {
            const response = await api.post("/categories", this.form);

            if (response.data && response.data.category_id) {
                this.categories.push(response.data);
            }

            this.dialog = false;
        } catch (error) {
            console.error("Error adding category:", error);
        }
    },

  
    async updateCategory() {
        try {
          await api.put(`/categories/${this.form.category_id}`, this.form);
          const index = this.categories.findIndex((cat) => cat.category_id === this.form.category_id);
          if (index !== -1) this.categories[index] = { ...this.form };
          this.dialog = false;
        } catch (error) {
          console.error("Error updating category:", error);
        }
    },
  
    async deleteCategory(category_id) {
        try {
          await api.delete(`/categories/${category_id}`);
          this.categories = this.categories.filter((cat) => cat.category_id !== category_id);
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      },
    },
};
</script>
  