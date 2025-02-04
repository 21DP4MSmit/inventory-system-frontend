<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card elevation="2">
            <v-img
              height="200"
              class="bg-gradient"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
            >
              <v-card-title class="text-h4 font-weight-bold text-white mt-8">
                Welcome to the Inventory System
              </v-card-title>
              <v-card-subtitle class="text-h6 text-white">
                Manage your stock easily using this system
              </v-card-subtitle>
            </v-img>
  
            <v-card-text class="py-4">
              <v-row justify="center" class="mt-4">
                <v-col cols="12" sm="6" md="4">
                  <v-btn
                    block
                    :to="{ path: '/inventory', replace: true }"
                    size="large"
                    class="mb-4"
                    elevation="2"
                  >
                    <v-icon start>mdi-clipboard-list</v-icon>
                    Go to Inventory
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-btn
                    block
                    :to="{ path: '/categories', replace: true }"
                    size="large"
                    elevation="2"
                  >
                    <v-icon start>mdi-tag</v-icon>
                    Go to Categories
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>