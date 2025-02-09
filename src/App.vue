<template>
  <v-app>
    <v-navigation-drawer
      v-if="showNavigation"
      v-model="drawer"
      temporary
      app
    >
      <v-list>
        <!-- Profilbild und Benutzername -->
        <v-list-item>
          <v-list-item-avatar @click="goToProfile">
            <v-img :src="userAvatar"/>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ userName }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider />
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      v-if="showNavigation"
      app
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      />
      <!-- Profilbild in der App-Bar -->
      <v-avatar
        size="100"
        class="mr-4"
        @click="goToProfile"
      >
        <v-img :src="userAvatar" />
      </v-avatar>
      <v-toolbar-title>CampusConnect</v-toolbar-title>
      <v-spacer />
      <!-- Navigation für Desktop -->
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        :to="item.path"
        text
        class="d-none d-sm-flex"
      >
        {{ item.title }}
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <!-- Snackbar -->
      <v-snackbar
        :model-value="snackbar.show"
        :color="snackbar.color"
        timeout="2000"
        rounded="pill"
        @update:model-value="store.setSnackbarVisibility"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn
            text
            color="white"
            @click="handleSnackbarAction"
          >
            Anzeigen
          </v-btn>
        </template>
      </v-snackbar>
      <suspense>
        <router-view />
      </suspense>
    </v-main>
  </v-app>
</template>

<script>
import { useStore } from "@/stores/snackbar";
import setupRealtime from "@/services/realtimeListener";
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { SessionManager } from "./Manager/sessionManager";


export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const snackbar = computed(() => store.snackbar);
    const drawer = ref(false);

    const userAvatar = ref('src/assets/CC_logo.png');
    const userName = ref('');

    const menuItems = [
      { title: 'Home', path: '/home', icon: 'mdi-home' },
      { title: 'Fahrten suchen', path: '/fahrten-suche', icon: 'mdi-magnify' },
      { title: 'Anfragen', path: '/verwaltung', icon: 'mdi-message-text' },
      { title: 'Neu', path: '/fahrt', icon:  'mdi-map-marker-plus' }
    ];

    // Während dem Login und der Registrierung soll keine Nav angezeigt werden
    const showNavigation = computed(() => {
      return !['/login', '/registrierung'].includes(route.path);
    });

    const checkAuth = async () => {
      const user = await SessionManager.getUser();
      if (user) {
        userName.value = user.username;
        
      } else {
        router.push('/login');
      }
    };

    onMounted(async () => {
      if (!store.realtimeInitialized) {
        setupRealtime(store, router);
        store.realtimeInitialized = true;
      }
      await checkAuth();
    });

    onUnmounted(async () => {
      await SessionManager.logout();
    })

    const handleSnackbarAction = () => {
      console.log("Snackbar-Button wurde geklickt!");
      if (snackbar.value.action) {
        snackbar.value.action();
      }
      store.setSnackbarVisibility = false;
    };

    const goToProfile = () => {
      router.push('/profil');
    };

    return {
      snackbar,
      store,
      handleSnackbarAction,
      drawer,
      menuItems,
      showNavigation,
      userAvatar,
      userName,
      goToProfile
    };
  },
};
</script>

<style scoped>

.nav{
  color: rgba(47, 96, 36, 0.274);
}
/* Fügen Sie hier bei Bedarf zusätzliche Stile hinzu */
</style>
