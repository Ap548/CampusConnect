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
          class="counter-card"
        >
          <v-card-title class="primary--text">
            CO₂ Einsparung
          </v-card-title>
          <v-card-text>
            <p class="text-subtitle-1 text-center mb-4">
              Verfolge deinen bisher eingesparten CO₂ Verbrauch!
            </p>
            <v-progress-linear
              :value="progress"
              height="60"
              rounded
              color="transparent"

              class="mb-4"
            >
              <strong class="text-h4">{{ totalCo2Saved }} g CO₂ eingespart</strong>
            </v-progress-linear>
            <v-btn
              color="rgba(47, 96, 36, 0.274)"
              class="mt-4"
              :loading="loading"
              block
              rounded
              x-large
              elevation="2"
              @click="calculateTotalCo2Savings"
            >
              <v-icon start>
                mdi-refresh
              </v-icon>
              Berechne CO₂ Einsparung
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Top CO2 Sparer Ranking -->
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
      >
        <h3 class="text-center mt-6 mb-4">
          Top CO2 Sparer
        </h3>
        <v-row>
          <v-col cols="4">
            <v-card
              class="text-center"
              elevation="6"
            >
              <v-img
                height="50"
                src="../assets/gold.png"
                class="mx-auto"
                max-width="50"
                min-height="100"
              />
              <!-- <v-avatar
                size="50"
                class="mx-auto mt-2"
              >
                <v-img :src="topCo2Savers[2]?.avatar" />
              </v-avatar> -->
              <v-card-title>1. Platz</v-card-title>
              <v-card-text>
                {{ topCo2Savers[2]?.username || "Niemand" }}
              </v-card-text>
              <v-card-subtitle>
                {{ topCo2Savers[2]?.totalCo2Saved || "0" }} g CO2
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card
              class="text-center"
              elevation="4"
            >
              <v-img
                height="50"
                src="../assets/silver.png"
                class="mx-auto"
                max-width="50"
                min-height="100"
              />
              <!-- <v-avatar
                size="50"
                class="mx-auto mt-2"
              >
                <v-img :src="topCo2Savers[1]?.avatar" />
              </v-avatar> -->
              <v-card-title>2. Platz</v-card-title>
              <v-card-text>
                {{ topCo2Savers[1]?.username || "Niemand" }}
              </v-card-text>
              <v-card-subtitle>
                {{ topCo2Savers[1]?.totalCo2Saved || "0" }} g CO2
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card
              class="text-center"
              elevation="2"
            >
              <v-img
                height="50"
                src="../assets/bronze.png"
                class="mx-auto"
                max-width="50"
                min-height="100"
              />

              <!-- <v-avatar
                size="50"
                class="mx-auto mt-2"
              >
                <v-img :src="topCo2Savers[0]?.avatar" />
              </v-avatar> -->
              <v-card-title>3. Platz</v-card-title>
              <v-card-text>
                {{ topCo2Savers[0]?.username || "Niemand" }}
              </v-card-text>
              <v-card-subtitle>
                {{ topCo2Savers[0]?.totalCo2Saved || "0" }} g CO2
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

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
    const topCo2Savers = ref([]);

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

    const loadTopCo2Savers = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('username, totalCo2Saved, avatar')
          .order('totalCo2Saved', { ascending: true })
          .limit(3);

        if (error) {
          console.error("Fehler beim Laden des Rankings:", error);
          return;
        }

        topCo2Savers.value = data.map(user => ({
          username: user.username,
          totalCo2Saved: user.totalCo2Saved || 0,
          avatar: user.avatar?.url || "https://img.icons8.com/color/96/000000/bronze-medal.png"
        }));
      } catch (err) {
        console.error("Fehler beim Laden des Rankings:", err);
      }
    };

    onMounted(async () => {
      await calculateTotalCo2Savings();
      await loadTopCo2Savers();
    });

    return {
      totalCo2Saved,
      loading,
      progress,
      topCo2Savers,
      calculateTotalCo2Savings,
      getCoordinates
    };
  },
};
</script>

<style scoped>
/* Verbessertes Design */

.counter-card {
  transition: all 0.3s ease;
}

.counter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(47, 96, 36, 0.274);
}
.v-card {
  border-radius: 12px;
}

.v-btn {
  text-transform: none;
  transition: all 0.3s ease;
}
.v-btn:hover {
  transform: scale(1.05);
}
.text-h4 {
  font-size: 2.5rem; /* Adjust the value as needed */
}

 .text-center v-card {
height : 211px;
max-height : 211px;
box-shadow: rgba(47, 96, 36, 0.274);

}
</style>
