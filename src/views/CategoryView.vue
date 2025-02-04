<template>
    <v-container>
      <v-card elevation="2">
        <v-card-title class="py-4 bg-gradient">
          <span class="text-h5">
              <v-icon class="mr-2">mdi-tag</v-icon>
              Category Management
          </span>
        </v-card-title>
  
        <v-data-table
          :headers="headers"
          :items="categories"
          class="elevation-0"
          item-value="category_id"
        >
          <template v-slot:top>
            <v-toolbar flat class="border-b">
              <v-toolbar-title class="text-subtitle-1 font-weight-medium">
                Manage Categories
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="openAddDialog"
                prepend-icon="mdi-plus"
                class="text-none"
              >
                Add Category
              </v-btn>
            </v-toolbar>
          </template>

          <!-- Customize how each column is displayed -->
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.category_name }}</td>
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
                  @click="deleteCategory(item.category_id)"
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
                <span class="text-h5">{{ isEditing ? "Edit Category" : "Add Category" }}</span>
            </v-card-title>
  
          <v-card-text class="pt-4">
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="form.category_name"
                label="Category Name"
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
              @click="isEditing ? updateCategory() : addCategory()"
              :loading="loading"
            >
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
            { title: "Category Name", key: "category_name", width: "85%" },
            { title: "", key: "actions", width: "15%", sortable: false }
        ],
        dialog: false,
        isEditing: false,
        valid: true,
        loading: false,
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
