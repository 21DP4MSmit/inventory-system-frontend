<template>
    <v-container class="py-12">
      <v-card>
        <v-card-title>
          Welcome to the Inventory System
        </v-card-title>
        <v-card-text>
          <p>View stock information without logging in.</p>
          <v-btn color="primary" @click="goToLogin">Login</v-btn>
        </v-card-text>
      </v-card>
  
      <v-data-table
        :headers="headers"
        :items="stockItems"
        class="mt-6"
        item-value="name"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Available Stock</v-toolbar-title>
          </v-toolbar>
        </template>
      </v-data-table>
    </v-container>
  </template>
  
  <script>
  import api from "../api.js";
  
  export default {
    data() {
      return {
        stockItems: [],
        headers: [
          { text: "Name", value: "name" },
          { text: "Category ID", value: "category_id" },
          { text: "Quantity", value: "quantity" },
        ],
      };
    },
  
    async created() {
      await this.fetchStock();
    },
  
    methods: {
      async fetchStock() {
        try {
          const response = await api.get("/items");
          this.stockItems = response.data;
        } catch (error) {
          console.error("Error fetching stock:", error.response?.data || error);
        }
      },
  
      goToLogin() {
        this.$router.push("/login");
      },
    },
  };
</script>
  
  
  <style scoped>
  .v-container {
    max-width: 800px;
    margin: auto;
  }
  </style>
  