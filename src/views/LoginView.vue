<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="login-card mx-auto" max-width="450" elevation="3">
      <div class="login-header pa-6 text-center">
        <v-icon size="56" color="white" class="mb-2">mdi-warehouse</v-icon>
        <h1 class="text-h4 font-weight-bold text-white mb-1">
          Inventory System
        </h1>
        <p class="text-subtitle-1 text-white opacity-80">
          Sign in to your account
        </p>
      </div>

      <v-card-text class="pt-6 pb-4 px-6">
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="Username"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            class="mb-3"
            :error-messages="usernameError"
            @input="usernameError = ''"
            autocomplete="username"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="showPassword ? 'text' : 'password'"
            @click:append-inner="showPassword = !showPassword"
            class="mb-6"
            :error-messages="passwordError"
            @input="passwordError = ''"
            autocomplete="current-password"
            required
          ></v-text-field>

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            :loading="loading"
            class="mb-4 text-none"
          >
            Sign In
          </v-btn>
        </v-form>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
          closable
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn variant="text" block @click="goToHome" class="text-none">
          Go back to home page
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useNotificationStore } from "../stores/notification";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const username = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);
const showPassword = ref(false);
const usernameError = ref("");
const passwordError = ref("");

const validateForm = () => {
  error.value = null;
  usernameError.value = "";
  passwordError.value = "";

  let isValid = true;

  if (!username.value) {
    usernameError.value = "Username is required";
    isValid = false;
  }

  if (!password.value) {
    passwordError.value = "Password is required";
    isValid = false;
  }

  return isValid;
};

async function handleLogin() {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;
    await userStore.login({
      username: username.value,
      password: password.value,
    });
    notificationStore.success(`Welcome back, ${username.value}!`);
    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.error || "Invalid username or password";
    notificationStore.error("Login failed: " + error.value);
  } finally {
    loading.value = false;
  }
}

function goToHome() {
  router.push("/");
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--secondary-color),
    var(--surface-color)
  );
}

.login-card {
  border-radius: 12px;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(
    145deg,
    var(--primary-color),
    var(--accent-color)
  );
}
</style>
