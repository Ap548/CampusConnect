<template>
  <div class="alternativ-fahrten">
    <h1 class="text-xl font-bold">
      Alternative Fahrten
    </h1>
    <div
      v-if="alternatives.length === 0"
      class="mt-4"
    >
      <p>Keine alternativen Fahrten verfügbar.</p>
    </div>
    <div v-else>
      <div
        v-for="ride in alternatives"
        :key="ride.id_fahrt"
        class="ride-card p-4 mb-4 rounded shadow-md border"
      >
        <p><strong>Abfahrtsort:</strong> {{ ride.start }}</p>
        <p><strong>Zielort:</strong> {{ ride.ziel }}</p>
        <p><strong>Datum:</strong> {{ ride.datum }}</p>
        <p><strong>Uhrzeit:</strong> {{ ride.zeit }}</p>
        <p><strong>Verfügbare Plätze:</strong> {{ ride.anzahl_mitfahrer }}</p>
        <v-btn
          color="primary"
          class="mt-2"
          @click="goToDetails(ride.id_fahrt)"
        >
          Details anzeigen
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { supabase } from "@/Clients/supabaseClient";

export default {
  name: "AlternativeFahrten",
  props: {
    start: {
      type: String,
      default: '',
    },
    ziel: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const alternatives = ref([]);
   

    const loadAlternatives = async () => {
      const { data, error } = await supabase
        .from("fahrten")
        .select("*")
        .eq("start", props.start)
        .eq("ziel", props.ziel);
      if (error) console.error("Fehler beim Laden alternativer Fahrten:", error);
      else alternatives.value = data;
    };

 
    onMounted(loadAlternatives);
    return { alternatives };
  },
};
</script>

<style scoped>
.alternativ-fahrten { padding: 16px; }
.ride-card { background-color: #f9f9f9; }
</style>
