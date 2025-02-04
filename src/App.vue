<template>
  <v-app>
    <v-container>
      <v-app-bar color="primary" dark>
        <v-toolbar-title>Inventory System</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn to="/" text>Home</v-btn>
        <v-btn to="/inventory" text>Inventory</v-btn>
        <v-btn to="/categories" text>Categories</v-btn>
      </v-app-bar>

      <router-view></router-view>
    </v-container>
  </v-app>
</template>
