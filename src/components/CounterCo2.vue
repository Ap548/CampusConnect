<script>
  import { supabase } from '@/Clients/supabaseClient';
  import { SessionManager } from '@/Manager/sessionManager';
  import { ref, onMounted } from 'vue';
  
  const locations = {
    "Universität Bayreuth": [11.579589, 49.941243],
    "Campus Kulmbach": [11.451001854688018, 50.1086989],
    "Studiocomfort": [11.566191987375756, 49.93455265],
    "Studi am Roten Hügel": [11.544842752885756, 49.94174725],
    "Studi Jakobsstraße": [11.55496769409618, 49.9311856],
    "Studi Apart": [11.616358332825719, 49.9582973],
    "Studi Storchennest": [11.5844945, 49.9333393],
    "Uni Apart": [11.579680859060892, 49.94623665],
    "ZOH": [11.5744666, 49.9460188],
    "Bahnhof Kulmbach": [11.451983849198491, 50.109635850000004],
    "Hauptbahnhof Bayreuth": [11.5798173, 49.9498313]
  };
  
  // Funktion zur Berechnung der Distanz zwischen zwei Koordinaten
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) {
      console.warn("Ungültige Koordinaten:", coord1, coord2);
      return null;
    }
  
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Radius der Erde in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distanz in km
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  
  export default {
    setup() {
      const totalCo2Saved = ref(0);
      const loading = ref(false);
      const progress = ref(0);
  
      const getCoordinates = (place) => {
        if (!locations[place]) {
          console.warn(`Koordinaten für Ort "${place}" nicht gefunden: ${place}`);
          return null;
        }
        return locations[place];
      };
  
      const calculateCo2 = (distance, passengers) => {
        const co2PerKmPerCar = 120;
        const individualCo2 = co2PerKmPerCar * distance;
        const sharedCo2 = individualCo2 / Math.max(1, passengers);
        return individualCo2 - sharedCo2;
      };
  
      const calculateTotalCo2Savings = async () => {
        loading.value = true;
        progress.value = 0;
  
        const user = await SessionManager.getUser();
        if (!user) return;
  
        try {
          const { data: fahrtenData, error } = await supabase
            .from("anfragen")
            .select("id_anfrage, fahrt_id, status, fahrten(id_fahrt, start, ziel)")
            .or(`anfrager.eq.${user.username},created_by.eq.${user.username}`);
  
          if (error) {
            console.error("Fehler beim Laden der Fahrten:", error);
            loading.value = false;
            return;
          }
  
          let totalSaved = 0;
          const numFahrten = fahrtenData.length;
  
          for (let i = 0; i < numFahrten; i++) {
            const fahrt = fahrtenData[i].fahrten;
  
            if (!fahrt) {
              console.warn(`Keine Fahrtinformationen für Anfrage ${fahrtenData[i].id_anfrage} gefunden.`);
              continue;
            }
  
            const startCoords = getCoordinates(fahrt.start);
            const zielCoords = getCoordinates(fahrt.ziel);
  
            if (!startCoords || !zielCoords) {
              console.warn(`Koordinaten für ${fahrt.start} oder ${fahrt.ziel} nicht gefunden.`);
              continue;
            }
  
            const distance = calculateDistance(startCoords, zielCoords);
  
            if (!distance) {
              console.warn(`Distanz für Fahrt ${fahrt.id_fahrt} konnte nicht berechnet werden.`);
              continue;
            }
  
            const { data: anfragenData, error: anfragenError } = await supabase
              .from("anfragen")
              .select('*', { count: 'exact' })
              .eq("fahrt_id", fahrt.id_fahrt)
              .eq("status", "akzeptiert")
  
            if (anfragenError) {
              console.error("Fehler beim Laden der Anfragen:", anfragenError);
              continue;
            }
  
            const passengers = anfragenData ? (anfragenData.length + 1) : 1;
  
            const co2Saved = calculateCo2(distance, passengers);
            totalSaved += co2Saved;
  
            progress.value = ((i + 1) / numFahrten) * 100;
          }
  
          totalCo2Saved.value = Math.round(totalSaved);
        } catch (err) {
          console.error("Fehler bei der CO2-Berechnung:", err);
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(() => {
        calculateTotalCo2Savings();
      });
  
      return {
        totalCo2Saved,
        loading,
        progress,
        calculateTotalCo2Savings,
        getCoordinates
      };
    },
  };
  </script>
  
  <style scoped>
  /* Verbessertes Design */
  .v-card {
    border-radius: 12px;
  }
  
  .v-btn {
    text-transform: none;
  }
  .text-h4 {
    font-size: 2.5rem; 
  }
  </style>
  


<template>
    <v-container>
      <v-row justify="center">
        <v-col
          cols="12"
          md="8"
        >
          <v-card
            elevation="4"
            rounded="lg"
          >
            <v-card-title class="primary--text">
              CO₂ Einsparung
            </v-card-title>
            <v-card-text>
              <p>
                Verfolge deinen bisher eingesparten CO₂ Verbrauch!
              </p>
              <v-progress-linear
                :value="progress"
                height="25"
                rounded
                color="success"
              >
                <strong class="text-h4">{{ totalCo2Saved }} g CO₂ eingespart</strong>
              </v-progress-linear>
              <v-btn
                color="primary"
                class="mt-4"
                :loading="loading"
                @click="calculateTotalCo2Savings"
              >
                Berechne CO₂ Einsparung
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  