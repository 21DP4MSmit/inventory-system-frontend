<!-- LoginView.vue -->
<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5">Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="Username"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
          ></v-text-field>
          <v-btn type="submit" block color="primary" :loading="loading"
            >Login</v-btn
          >
        </v-form>
      </v-card-text>
      <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const username = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);

async function handleLogin() {
  try {
    loading.value = true;
    error.value = null;
    await userStore.login({
      username: username.value,
      password: password.value,
    });
    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.error || "An error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
