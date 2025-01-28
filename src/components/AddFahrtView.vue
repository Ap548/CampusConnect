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
  "Universität Bayreuth",
  "Hauptbahnhof Bayreuth",
  "Campus Kulmbach",
];

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
      .eq("username", user.username);

    if (clientError || clientData.length === 0) {
      console.error("Fehler beim Abrufen der Benutzerinformationen:", clientError || "Benutzer nicht gefunden");
      return;
    }

    // ID des Benutzers abrufen
     const clientId = clientData[0].id_client;

    // Fahrt in der Tabelle "fahrten" erstellen
    const { data: fahrtData, error: fahrtError } = await supabase.from("fahrten").insert({
      start: start.value,
      ziel: ziel.value,
      datum: datum.value,
      zeit: zeit.value,
      anzahl_mitfahrer: anzahl_mitfahrer.value || null, // Falls leer, wird `null` eingefügt
      created_by: user.username,
    }).select("id_fahrt"); // `id_fahrt` für die Referenz in `verfasst_von` abrufen

    if (fahrtError || fahrtData.length === 0) {
      console.error("Fehler beim Erstellen der Fahrt:", fahrtError || "Fahrt konnte nicht erstellt werden");
      return;
    }

    const fahrtId = fahrtData[0].id_fahrt;

    // Eintrag in der Tabelle "verfasst_von" erstellen
    const { error: verfasstError } = await supabase.from("verfasst_von").insert({
      id_user: clientId,
      id_fahrt: fahrtId
    });

    if (verfasstError) {
      console.error("Fehler beim Erstellen des Eintrags in 'verfasst_von':", verfasstError);
      return;
    }

    console.log("Fahrt erfolgreich erstellt und in 'verfasst_von' referenziert");

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

<template>
    <v-container class="container">
      <v-card
        class="FahrtenFormular"
        title="Fahrten"
      >
        <!-- Abfahrtsort und Zielort -->
        <v-row>
          <v-col>
            <v-select
              v-model="start"
              :items="locations"
              label="Startpunkt"
              placeholder="Von"
              prepend-inner-icon="mdi-map-marker-account-outline"
              variant="solo-filled"
              rounded
            />
          </v-col>
          <v-col>
            <v-icon
              icon="mdi-ray-start-arrow"
              size="x-large"
            />
          </v-col>
          <v-col>
            <v-select
              v-model="ziel"
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
          <v-col>
            <v-text-field
              v-model="formattedDatum"
              label="Datum"
              prepend-inner-icon="mdi-calendar"
              variant="solo-filled"
              rounded
              readonly
              @click="date = true"
            >
              <v-menu
                v-model="date"
                :close-on-content-click="false"
                activator="parent"
                transition="scale-transition"
                offset-y
              >
                <v-date-picker
                  v-model="datum"
                  no-title
                  full-width
                  @update:model-value="handleDateSelect"
                />
              </v-menu>
            </v-text-field>
          </v-col>
        </v-row>
  
        <!-- Zeit -->
        <v-row>
          <v-col>
            <v-text-field
              v-model="formattedZeit"
              label="Uhrzeit"
              prepend-inner-icon="mdi-clock-time-four-outline"
              variant="solo-filled"
              rounded
              readonly
              @click="timePicker = true"
            >
              <v-menu
                v-model="timePicker"
                :close-on-content-click="false"
                activator="parent"
                transition="scale-transition"
                offset-y
              >
                <v-time-picker
                  v-model="zeit"
                  format="24hr"
                  color="green"
                  full-width
                  :allowed-minutes="allowedMinutes"
                  @update:model-value="handleTimeSelect"
                />
              </v-menu>
            </v-text-field>
          </v-col>
        </v-row>
  
        <!-- Mitfahrer -->
        <v-row>
          <v-col>
            <v-text-field
              v-model="mitfahrer"
              label="Mitfahrer"
              placeholder="Anzahl der Mitfahrer"
              type="number"
              prepend-inner-icon="mdi-account-outline"
              variant="solo-filled"
              rounded
            />
          </v-col>
        </v-row>
  
        <!-- Button -->
        <v-row>
          <v-btn
            color="primary"
            dark
            rounded
            @click="submitFahrt"
          >
            Fahrten eintragen
          </v-btn>
        </v-row>
      </v-card>
    </v-container>
  </template>
  

  