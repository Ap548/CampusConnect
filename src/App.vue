
<template>
  <!-- Snackbar -->
  <v-snackbar
    :model-value="snackbar.show"
    :color="snackbar.color"
    rounded="pill"
    timeout="5000"
    @update:model-value="store.setSnackbarVisibility"
  >
    {{ snackbar.message }}
  </v-snackbar>
  <suspense>
    <router-view />
  </suspense>
</template>

<script>
import { useStore } from "@/stores/snackbar";
import setupRealtime from "@/services/realtimeListener";
import { onMounted, computed } from "vue";

export default {
  setup() {
    const store = useStore();
    const snackbar = computed(() => store.snackbar);

    onMounted(() => {
      
        setupRealtime(store);
        
    });

    return {
      snackbar,
      store,
    };
  },
};
</script>
