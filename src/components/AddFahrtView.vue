<template>
  <v-container fluid>
    <!-- Überschrift -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-h5">
            Fahrten erstellen
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
          :item-props="itemProps"
          :items="locations"
          label="Startpunkt"
          placeholder="Von"
          prepend-inner-icon="mdi-map-marker-account-outline"
          variant="solo-filled"
          rounded
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-autocomplete
          v-model="ziel"
          :item-props="itemProps"
          :items="locations"
          label="Ziel"
          placeholder="Bis"
          prepend-inner-icon="mdi-map-marker-account-outline"
          variant="solo-filled"
          rounded
        />
      </v-col>
    </v-row>

    <!-- Datum -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-date-picker
          v-model="datum"
          label="Datum"

          prepend-inner-icon="mdi-calendar"
          variant="solo-filled"
          rounded
          @update:model-value="handleDateSelect"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <!-- Zeit -->

        <v-time-picker
          v-model="zeit"
          format="24hr"
          color="green"
          full-width
          :allowed-minutes="allowedMinutes"
          @update:model-value="handleTimeSelect"
        />
      </v-col>
    </v-row>

    <!-- Mitfahrer -->
    <!-- Personenanzahl auswählen -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-select
          v-model="anzahl_mitfahrer"
          label="Personenanzahl"
          :items="[1, 2, 3, 4, 5]"
          outlined
          dense
          required
        />
      </v-col>
    </v-row>

    <!-- Button -->
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          dark
          rounded
          @click="submitFahrt"
        >
          Fahrten eintragen
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { SessionManager } from "../Manager/sessionManager";
import { supabase } from "../Clients/supabaseClient";

// Aktueller Benutzer
const user = await SessionManager.getUser();

// Formularwerte
const start = ref("");
const ziel = ref("");
const datum = ref(null);
const formattedDatum = ref("");
const zeit = ref(null);
const formattedZeit = ref("");
const anzahl_mitfahrer = ref("");
const date = ref(false);
const timePicker = ref(false);

// Verfügbare Orte
const locations = [
  {
        name: 'Universität Bayreuth',
        id: 1,
        icon: 'mdi-account-school-outline'
      },
      {
        name: 'Campus Kulmbach',
        id: 2,
        icon:'mdi-account-school-outline'
      },
      {
        name: 'ZOH',
        id: 3,
        icon: 'mdi-bus-outline'
      },
      {
        name: 'Hauptbahnhof Bayreuth',
        id: 4,
        icon: 'mdi-train-outline'
      },
      {
        name: 'Bahnhof Kulmbach',
        id: 5,
        icon: 'mdi-train-outline'
      },
      {
        name: 'Studi am Roten Hügel',
        id: 6,
        icon: 'mdi-office-building-outline'
      },
      {
        name: 'Studi Jakobsstraße',
        id: 7,
         icon: 'mdi-office-building-outline'
      },
      {
        name: 'Studi Apart',
        id: 8,
         icon: 'mdi-office-building-outline'
      },
      {
        name: 'Studi Storchennest',
        id: 9,
         icon: 'mdi-office-building-outline'
      },
      {
        name: 'Uni Apart',
        id: 10,
         icon: 'mdi-office-building-outline'
      },
      {
        name: 'Studiocomfort',
        id: 11,
         icon: 'mdi-office-building-outline'
      }
];
const itemProps = (location) => {
        return {
          title: location.name,
          icon: location.icon,
        }
      }

// Nur Minuten in 5er-Schritten erlauben
const allowedMinutes = (minute) => minute % 5 === 0;

// Datum formatieren in dd/mm/yy
const handleDateSelect = (value) => {
  if (value) {
    const dateObj = new Date(value);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear()).slice(-2);
    formattedDatum.value = `${day}/${month}/${year}`;
    setTimeout(() => {
      date.value = false; // Verzögertes Schließen des Menüs
    }, 300); // 300 Millisekunden Verzögerung
  }
};

// Uhrzeit formatieren in hh:mm
const handleTimeSelect = (value) => {
  if (value) {
    const [hours, minutes] = value.split(":");
    formattedZeit.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    setTimeout(() => {
      timePicker.value = false; // Verzögertes Schließen des Menüs
    }, 200); // 200 Millisekunden Verzögerung
  }
};

// Fahrt speichern
const submitFahrt = async () => {
  if (!formattedDatum.value || !formattedZeit.value) {
    console.error("Datum und Zeit müssen ausgefüllt sein!");
    return;
  }

  try {
    // Benutzerinformationen basierend auf dem Benutzernamen abrufen
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("username", user.username)
      .single();

    if (clientError || clientData.length === 0) {
      console.error("Fehler beim Abrufen der Benutzerinformationen:", clientError || "Benutzer nicht gefunden");
      return;
    }

    // // ID des Benutzers abrufen
    //  const clientId = clientData[0].id_client;

    // Fahrt in der Tabelle "fahrten" erstellen
    const { data: fahrtData, error: fahrtError } = await supabase.from("fahrten").insert({
      start: start.value.name,
      ziel: ziel.value.name,
      datum: datum.value,
      zeit: zeit.value,
      anzahl_mitfahrer: anzahl_mitfahrer.value || null, // Falls leer, wird `null` eingefügt
      created_by: user.username,
    }).select("id_fahrt"); // `id_fahrt` für die Referenz in `verfasst_von` abrufen

    if (fahrtError || fahrtData.length === 0) {
      console.error("Fehler beim Erstellen der Fahrt:", fahrtError || "Fahrt konnte nicht erstellt werden");
      return;
    }

    // const fahrtId = fahrtData[0].id_fahrt;

    // // Eintrag in der Tabelle "verfasst_von" erstellen
    // const { error: verfasstError } = await supabase.from("verfasst_von").insert({
    //   id_user: clientId,
    //   id_fahrt: fahrtId
    // });

    // if (verfasstError) {
    //   console.error("Fehler beim Erstellen des Eintrags in 'verfasst_von':", verfasstError);
    //   return;
    // }

    // console.log("Fahrt erfolgreich erstellt und in 'verfasst_von' referenziert");

    // Optional: Formular zurücksetzen
    start.value = "";
    ziel.value = "";
    datum.value = null;
    formattedDatum.value = "";
    zeit.value = "";
    formattedZeit.value = "";
    anzahl_mitfahrer.value = "";
  } catch (error) {
   console.error("Ein unerwarteter Fehler ist aufgetreten:", error);
   }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.FahrtenFormular {
  display: flex;
  flex-direction: column;
  align-content: center;
  width: 100%;
  height: 100%;
}
</style>
