<template>
  <v-container fluid>
    <!-- Überschrift -->
    <v-row>
      <v-col cols="12">
        <v-card
          class="pa-4"
          elevation="4"
          rounded="lg"
        >
          <v-card-title class="text-h5 primary--text">
            Fahrt erstellen
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Abfahrtsort und Zielort -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-autocomplete
          v-model="start"
          :items="locations"
          item-title="name"
          item-value="name"
          label="Startpunkt"
          placeholder="Von"
          prepend-inner-icon="mdi-map-marker-account-outline"
          variant="outlined"
          rounded="lg"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-autocomplete
          v-model="ziel"
          :items="locations"
          item-title="name"
          item-value="name"
          label="Ziel"
          placeholder="Bis"
          prepend-inner-icon="mdi-map-marker-account-outline"
          variant="outlined"
          rounded="lg"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Benutzernamen-Suche -->
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="inviteUser"
          v-model:search-input="searchUsername"
          :items="users"
          item-title="username"
          item-value="username"
          label="Benutzer einladen"
          placeholder="@username"
          prepend-inner-icon="mdi-account-plus-outline"
          variant="outlined"
          rounded="lg"
          clearable
          chips
          closable-chips
          multiple
          @update:search-input="fetchUsers"
        >
          <template #chip="{ props, item }">
            <v-chip
              v-bind="props"
              
              :text="item.username"
            />
          </template>
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              
            >
              <v-list-item-title :text="item.username" />
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>

    <!-- Datum und Uhrzeit -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-date-picker
          v-model="datum"
          label="Datum"
          :allowed-dates="allowedDates"
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
          rounded="lg"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-time-picker
          v-model="zeit"
          format="24hr"
          label="Uhrzeit"
          :allowed-hours="allowedHours"
          :allowed-minutes="allowedMinutes"
          prepend-inner-icon="mdi-clock-outline"
          variant="outlined"
          rounded="lg"
        />
      </v-col>
    </v-row>

    <!-- Mitfahrer -->
    <v-row>
      <v-col cols="12">
        <v-card
          class="pa-4"
          elevation="2"
          rounded="lg"
        >
          <v-card-title class="text-subtitle-1">
            Mitfahrer (max. 4)
          </v-card-title>
          <v-card-text>
            <v-slider
              v-model="anzahl_mitfahrer"
              :max="4"
              :min="0"
              :step="1"
              tick-size="4"
              ticks="always"
              thumb-label="always"
              thumb-color="rgba(47, 96, 36, 0.274)"
              color="rgba(38, 72, 30, 0.767)"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Button -->
    <v-row >
      <v-col cols="12" >
        <v-btn
        class="button"
          color="rgba(47, 96, 36, 0.274)"
          rounded="lg"
          @click="submitFahrt"
        >
          Fahrt erstellen
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { SessionManager } from "../Manager/sessionManager";
import { supabase } from "../Clients/supabaseClient";

// Aktueller Benutzer
const user = await SessionManager.getUser();

// Formularwerte
const start = ref("");
const ziel = ref("");
const datum = ref(null);
const zeit = ref(null);
const anzahl_mitfahrer = ref(0);
const inviteUser = ref([]);
const searchUsername = ref("");
const users = ref([]);

// Verfügbare Orte
const locations = [
  { name: "Universität Bayreuth", id: 1 },
  { name: "Campus Kulmbach", id: 2 },
  { name: "ZOH", id: 3 },
  { name: "Hauptbahnhof Bayreuth", id: 4 },
  { name: "Bahnhof Kulmbach", id: 5 },
  { name: "Studi am Roten Hügel", id: 6},
  { name: "Studi Jakobsstraße", id:7 },
  { name: "Studi Apart", id: 8},
  { name: "Studi Storchennest", id: 9},
  { name: "Uni Apart", id: 10},
  { name: "Studiocomfort", id: 11}
];

const fetchUsers = async (searchTerm = "") => {
  try {
    let query = supabase.from("clients").select("username");

    if (searchTerm) {
      query = query.ilike("username", `%${searchTerm}%`);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      users.value = data.map((user) => ({
        username: user.username,
        avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${user.username}`,
      }));
    }
  } catch (e) {
    console.error("Error fetching users:", e);
  }
};

// Datumvalidierung
const allowedDates = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
  const selectedDate = new Date(date);
  return selectedDate >= today;
};

const allowedHours = (hour) => {
  if (!datum.value) return true;

  const selectedDate = new Date(datum.value);
  const now = new Date();

  return selectedDate.toDateString() !== now.toDateString() || hour >= now.getHours();
};

const submitFahrt = async () => {
  if (!start.value || !ziel.value || !datum.value || !zeit.value) {
    console.error("Bitte füllen Sie alle Felder aus!");
    return;
  }

  try {
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("username", user.username)
      .single();

    if (clientError) {
      console.error(
        "Fehler beim Abrufen der Benutzerinformationen:",
        clientError
      );
      return clientData;
    }

    const { data: fahrtData, error: fahrtError } = await supabase
      .from("fahrten")
      .insert({
        start: start.value,
        ziel: ziel.value,
        datum: datum.value,
        zeit: zeit.value,
        anzahl_mitfahrer: anzahl_mitfahrer.value || null,
        created_by: user.username,
      })
      .select("id_fahrt")
      .single();

    if (fahrtError) {
      console.error("Fehler beim Erstellen der Fahrt:", fahrtError);
      return;
    }

    console.log("Fahrt erfolgreich erstellt:", fahrtData);

    start.value = "";
    ziel.value = "";
    datum.value = null;
    zeit.value = null;
    anzahl_mitfahrer.value = 0;
    inviteUser.value = null;
    searchUsername.value = "";
    users.value = [];
  } catch (error) {
    console.error("Ein unerwarteter Fehler ist aufgetreten:", error);
  }
};



onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.v-container {
  padding: 2rem;
}

.v-card {
  border-radius: 1rem;
  box-shadow: rgba(47, 96, 36, 0.274);
}

.v-autocomplete {
  margin-bottom: 1rem;
}

.v-slider {
  margin-top: 1rem;
}

.v-btn {
  text-transform: none;
}
.button{
  margin-left: 280px;
}
</style>
