<template>
  <v-app theme="dark">
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      location="left"
      elevation="2"
      class="sidebar-gradient"
    >
    <v-list-item
        prepend-icon="mdi-warehouse"
        title="Inventory System"
        nav
        class="px-2 py-4"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
            color="white"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="py-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="item.subtitle"
          link
          class="mb-1"
          active-class="active-nav-item"
        ></v-list-item>
      </v-list>

      <template v-slot:bottom>
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-cog"
            title="Settings"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-help-circle"
            title="Help & Support"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Mobile top bar -->
    <v-app-bar
      class="d-flex d-sm-none"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Inventory System</v-toolbar-title>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container class="py-8 px-6">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: true,
    rail: false,
    menuItems: [
      {
        title: 'Dashboard',
        path: '/',
        icon: 'mdi-view-dashboard',
        subtitle: 'Welcome Page'
      },
      {
        title: 'Inventory',
        path: '/inventory',
        icon: 'mdi-clipboard-list',
        subtitle: 'Manage Items'
      },
      {
        title: 'Categories',
        path: '/categories',
        icon: 'mdi-tag',
        subtitle: 'Manage Categories'
      }
    ]
  }),

  watch: {
    $route() {
      if (window.innerWidth < 600) {
        this.drawer = false
      }
    }
  },

  mounted() {
    this.rail = window.innerWidth < 1280
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      if (window.innerWidth < 600) {
        this.drawer = false
      } else {
        this.drawer = true
        this.rail = window.innerWidth < 1280
      }
    }
  }
}
</script>

<style>
:root {
  --primary-color: #7C4DFF;      /* Deep Purple */
  --secondary-color: #242933;    /* Navy Dark */
  --accent-color: #5C6BC0;       /* Indigo */
  --surface-color: #2A2F3C;      /* Navy Gray */
  --error-color: #FF5252;        /* Bright Red */
  --success-color: #4CAF50;      /* Green */
  --warning-color: #FFC107;      /* Amber */
  --info-color: #2196F3;         /* Blue */
  --background-light: #363B47;   /* Lighter Navy */
  --text-primary: #FFFFFF;
  --text-secondary: #B0BEC5;
}

/* Dark theme styles */
.v-application {
  background-color: var(--secondary-color) !important;
  
  .v-card {
    background-color: var(--surface-color) !important;
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
    }
  }
  
  .v-btn--elevated {
    background-color: var(--primary-color) !important;
    
    &:hover {
      background-color: var(--accent-color) !important;
    }
  }

  /* Dialog styling */
  .v-dialog .v-card-title {
    background-color: var(--primary-color) !important;
  }
}

.sidebar-gradient {
  background: linear-gradient(145deg, var(--surface-color), var(--secondary-color)) !important;
}

.active-nav-item {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
  
  &:hover {
    background: var(--accent-color) !important;
  }
}

.v-list-item:hover {
  background: rgba(124, 77, 255, 0.1) !important;
  transition: background-color 0.3s ease;
}

.bg-gradient {
  background: linear-gradient(145deg, var(--primary-color), var(--accent-color)) !important;
  color: var(--text-primary) !important;
}

/* Additional styling for better contrast and depth */
.v-card-title {
  color: var(--text-primary);
}

.v-card-subtitle {
  color: var(--text-secondary);
}

.v-data-table {
  background-color: var(--surface-color) !important;
}

.v-toolbar {
  background-color: var(--background-light) !important;
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.v-dialog .bg-primary {
  background-color: var(--primary-color) !important;
}
</style>