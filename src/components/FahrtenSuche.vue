<template>
  <v-container class="search-rides-container">
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <v-card
          class="pa-6"
          elevation="3"
        >
          <h2 class="text-h4 mb-6 text-center">
            Fahrten suchen
          </h2>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <!-- Filtern nach Start- und Zielort -->
              <v-select
                v-model="start"
                v-model:search="autoCompleteSearchValue"
                label="Startort"
                :items="locations"
                item-title="name"
                item-value="name"
                prepend-inner-icon="mdi-map-marker-outline"
                variant="outlined"
                class="mb-4"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="ziel"
                v-model:search="autoCompleteSearchValue"
                label="Zielort"
                :items="locations"
                item-title="name"
                item-value="name"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
                class="mb-4"
              >
                <!-- Icons vor den Standorten für einfachere Orientierung/Erkennung -->
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <!-- Fahrten-Suche -->
          <v-btn
            block
            color="rgba(47, 96, 36, 0.274)"
            size="large"
            class="mt-4"
            rounded
            @click="searchRides"
          >
            Fahrten suchen
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <!-- Gefundene Fahrten auflisten -->
    <v-row
      v-if="fahrten.length"
      class="mt-8"
    >
      <v-col cols="12">
        <v-card
          v-for="fahrt in fahrten"
          :key="fahrt.id_fahrt"
          class="mb-4 ride-card"
          elevation="2"
        >
          <v-card-title class="text-h6">
            {{ fahrt.start }} → {{ fahrt.ziel }}
          </v-card-title>
          <v-card-subtitle>
            Datum: {{ formatDate(fahrt.datum) }} | Uhrzeit: {{ formatTime(fahrt.zeit) }}
          </v-card-subtitle>
          <v-card-text>
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="rgba(38, 72, 30, 0.468)">
                  mdi-account-multiple
                </v-icon>
              </v-col>
              <v-col>Plätze verfügbar: {{ fahrt.anzahl_mitfahrer }}</v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="rgba(38, 72, 30, 0.468)">
                  mdi-account
                </v-icon>
              </v-col>
              <v-col>Erstellt von: {{ fahrt.created_by }}</v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <!-- Anfrage für diese Fahrt stellen -->
            <v-btn
              color="rgba(38, 72, 30, 0.468)"
              variant="outlined"
              @click="anfrageStellen(fahrt.id_fahrt)"
            >
              Anfragen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <!-- Falls keine Fahrten vorliegen, "Not-Found" -->
    <v-row
      v-else-if="searchPerformed"
      justify="center"
      class="mt-8"
    >
      <v-col
        cols="12"
        md="8"
        lg="6"
        class="text-center"
      >
        <v-img
          src="../assets/not_found_white.png"
          max-height="200"
          contain
          class="mb-4"
        />
        <h3 class="text-h5 mb-2">
          Oh schade...
        </h3>
        <p class="text-body-1">
          Es scheint noch keine Fahrten zu geben.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>

import { useStore } from "@/stores/snackbar";
import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";
import setupRealtime from "@/services/realtimeListener";
import router from "@/router";


export default {

  data() {
    return {
      // Standorte
      locations: [
        { name: "Universität Bayreuth", id: 1, icon: "mdi-school-outline" },
        { name: "Campus Kulmbach", id: 2, icon: "mdi-school-outline" },
        { name: "ZOH", id: 3, icon: "mdi-bus" },
        { name: "Hauptbahnhof Bayreuth", id: 4, icon: "mdi-train" },
        { name: "Bahnhof Kulmbach", id: 5, icon: "mdi-train" },
        { name: "Studi am Roten Hügel", id: 6, icon: "mdi-office-building-outline" },
        { name: "Studi Jakobsstraße", id: 7, icon: "mdi-office-building-outline" },
        { name: "Studi Apart", id: 8, icon: "mdi-office-building-outline" },
        { name: "Studi Storchennest", id: 9, icon: "mdi-office-building-outline" },
        { name: "Uni Apart", id: 10, icon: "mdi-office-building-outline" },
        { name: "Studiocomfort", id: 11, icon: "mdi-office-building-outline" }
      ],
      start: "",
      ziel: "",
      fahrten: [],
      overlay: false,
      user: null,
      store: useStore(),
      autoCompleteSearchValue: ""
    };
  },
  async mounted() {
    this.user = await SessionManager.getUser();

    setupRealtime(this.store, this.fetchFahrten); // Echtzeit-Updates aktivieren
  },
  methods: {
    itemProps(location) {
      return {
        title: location.name,
        icon: location.icon,
      };
    },

    async searchRides() {
      this.searchPerformed = true;
      try {
        // Aktuelles Datum und Zeit
        // const currentDate = new Date();
        // const currentISODate = currentDate.toISOString().split("T")[0];
        // const currentTime = currentDate.toTimeString().split(" ")[0];

        // console.log("Aktuelles Datum:", currentISODate);
        // console.log("Aktuelle Uhrzeit:", currentTime);

        // Supabase-Abfrage
        const { data, error } = await supabase
          .from("fahrten")
          .select("*")
          .eq("start", this.start)
          .eq("ziel", this.ziel)
          // .gte("datum", currentISODate) // Filter für zukünftige Daten
          .order("datum", { ascending: true });

        if (error) {
          console.error("Fehler beim Abrufen der Fahrten:", error);
          return;
        }

        console.log("Rohdaten der Fahrten:", data);

        // Zusätzlicher Filter für Zeit (nur für Fahrten am aktuellen Datum)
        this.fahrten = data.filter(() => { //fahrt
          // if (fahrt.datum <= currentISODate) {
          //   // Zeit überprüfen
          //   return fahrt.zeit > currentTime;
          // }
          // Alle zukünftigen Tage
          return true;
        });



        console.log("Gefilterte Fahrten:", this.fahrten);
      } catch (error) {
        console.error("Ein Fehler ist aufgetreten:", error);
      }
    },

    // Datum und Zeit im richtigen Format anzeigen (Supabase speichert hh:mm:ss)
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('de-DE', options);
    },

    formatTime(timeString) {
      return timeString.slice(0, 5); // Zeigt nur Stunden und Minuten
    },

    async anfrageStellen(fahrtId) {
      const { error } = await supabase.from("anfragen").insert({
        fahrt_id: fahrtId,
        anfrager: this.user.username, // Der angemeldete Benutzer
        status: "ausstehend",
        created_by: null, // Wird im Trigger gesetzt

      });

      if (!error) {
        this.store.showSnackbar({
          message: "Anfrage erfolgreich gesendet!",
          color: "green",
          action: ()=> {
            router.push('Anfragenverwaltung')
          }

        });
      } else {
        this.store.showSnackbar({
          message: "Fehler beim Senden der Anfrage.",
          color: "red",


        });
      }
    },
  }
}
</script>

<style scoped>

.search-rides-container {
  max-width: 1200px;
  margin: 0 auto;
}

.ride-card {
  transition: all 0.3s ease;
}

.ride-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  color:rgba(38, 72, 30, 0.468);
  
}

.v-btn {
  text-transform: none;
}

</style>
