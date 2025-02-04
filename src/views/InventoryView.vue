<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-clipboard-list</v-icon>
          Inventory List
        </v-card-title>
  
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
              <v-btn color="primary" @click="fetchItems">
                <v-icon left>mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </v-toolbar>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import api from "../api.js";
  
  export default {
    data() {
      return {
        items: [],
        headers: [
          { title: "Item Name", key: "name" },
          { title: "Category ID", key: "category_id" },
          { title: "Quantity", key: "quantity" },
        ],
      };
    },
    async created() {
      await this.fetchItems();
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
    },
  };
  </script>
  