<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="welcome-card overflow-hidden">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="6"
              class="d-flex flex-column justify-center pa-6"
            >
              <h1 class="text-h3 font-weight-bold mb-2">
                Inventory Management System
              </h1>
              <p class="text-body-1 mb-6">
                Streamline your inventory operations with our comprehensive
                system. Track stock levels, manage categories, and get real-time
                insights with our powerful dashboard.
              </p>
              <div>
                <v-btn
                  color="primary"
                  size="large"
                  min-width="150"
                  class="mr-3 text-none"
                  prepend-icon="mdi-login"
                  @click="goToLogin"
                >
                  Login
                </v-btn>
                <v-btn
                  variant="tonal"
                  size="large"
                  class="text-none"
                  prepend-icon="mdi-information-outline"
                  @click="showFeatures = true"
                >
                  Learn More
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-none d-md-block">
              <div
                class="bg-gradient fill-height d-flex align-center justify-center pa-6"
              >
                <div class="hero-graphic">
                  <v-icon size="120" color="white" class="icon-shadow"
                    >mdi-view-dashboard</v-icon
                  >
                  <div class="hero-badge hero-badge-1">
                    <v-icon size="28" color="white">mdi-package-variant</v-icon>
                    <span>+42</span>
                  </div>
                  <div class="hero-badge hero-badge-2">
                    <v-icon size="28" color="white">mdi-tag-multiple</v-icon>
                    <span>5 Categories</span>
                  </div>
                  <div class="hero-badge hero-badge-3">
                    <v-icon size="28" color="white">mdi-trending-up</v-icon>
                    <span>+27%</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <h2 class="text-center text-h4 font-weight-bold mb-8">Key Features</h2>
      </v-col>

      <v-col cols="12" md="4" v-for="(feature, index) in features" :key="index">
        <v-card elevation="2" height="100%" class="feature-card">
          <v-card-text class="pa-6 text-center">
            <v-avatar size="64" :color="feature.color" class="mb-4 avatar-icon">
              <v-icon size="32" color="white">{{ feature.icon }}</v-icon>
            </v-avatar>
            <h3 class="text-h5 font-weight-bold mb-2">{{ feature.title }}</h3>
            <p class="text-body-2">{{ feature.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showFeatures" max-width="700">
      <v-card>
        <v-card-title class="py-4 px-6 bg-primary text-white">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          Key Features & Benefits
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col
              cols="12"
              md="6"
              v-for="(feature, index) in featuresDetailed"
              :key="index"
            >
              <div class="d-flex mb-4">
                <v-avatar :color="feature.color" class="mr-4">
                  <v-icon color="white">{{ feature.icon }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold mb-1">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2">{{ feature.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="goToLogin" class="text-none">
            Get Started
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showFeatures = ref(false);

const features = [
  {
    icon: "mdi-clipboard-check-outline",
    title: "Real-time Tracking",
    description:
      "Monitor inventory levels in real-time with automatic updates as stock moves in and out of your system.",
    color: "primary",
  },
  {
    icon: "mdi-chart-bar",
    title: "Advanced Analytics",
    description:
      "Get comprehensive insights with visual charts, trend analysis, and customizable reporting tools.",
    color: "info",
  },
  {
    icon: "mdi-image-filter-center-focus",
    title: "AI Object Detection",
    description:
      "Use our cutting-edge AI technology to automatically identify and categorize inventory items from images.",
    color: "success",
  },
];

const featuresDetailed = [
  {
    icon: "mdi-clipboard-check-outline",
    title: "Real-time Inventory Tracking",
    description:
      "Monitor stock levels instantly with automatic updates as items move in and out of your inventory system.",
    color: "primary",
  },
  {
    icon: "mdi-tag-multiple",
    title: "Category Management",
    description:
      "Organize your inventory with custom categories for easy filtering and reporting.",
    color: "indigo",
  },
  {
    icon: "mdi-chart-bar",
    title: "Visual Analytics",
    description:
      "Get insights into inventory trends with interactive charts and comprehensive reports.",
    color: "info",
  },
  {
    icon: "mdi-bell-outline",
    title: "Low Stock Alerts",
    description:
      "Receive notifications when items are running low to prevent stockouts and maintain optimal inventory levels.",
    color: "warning",
  },
  {
    icon: "mdi-history",
    title: "Transaction History",
    description:
      "Track all inventory movements with detailed transaction logs for complete audit control.",
    color: "deep-purple",
  },
  {
    icon: "mdi-account-group",
    title: "User Role Management",
    description:
      "Control access with customizable permissions for different team members based on responsibilities.",
    color: "teal",
  },
  {
    icon: "mdi-image-filter-center-focus",
    title: "AI-Powered Recognition",
    description:
      "Utilize machine learning to automatically identify and categorize items from photos for faster inventory management.",
    color: "success",
  },
  {
    icon: "mdi-file-export",
    title: "Export & Reporting",
    description:
      "Generate and export reports in multiple formats including PDF, Excel, and CSV for sharing and analysis.",
    color: "blue-grey",
  },
];

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.welcome-card {
  border-radius: 12px;
  overflow: hidden;
}

.bg-gradient {
  background: linear-gradient(
    145deg,
    var(--primary-color),
    var(--accent-color)
  );
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.hero-graphic {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-shadow {
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));
}

.hero-badge {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: float 3s infinite ease-in-out;
}

.hero-badge-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.hero-badge-2 {
  bottom: 30%;
  left: 15%;
  animation-delay: 0.5s;
}

.hero-badge-3 {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.avatar-icon {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.feature-card:hover .avatar-icon {
  transform: scale(1.1);
}

.cta-card {
  border-radius: 16px;
  overflow: hidden;
}
</style>
