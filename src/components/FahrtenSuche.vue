<template>
  <div>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="start"
            v-model:search="autoCompleteSearchValue"
            class="select"
            label="Startort"
            :items="locations"
            item-title="name"
            item-value="name"
            prepend-icon="mdi-map-marker-outline"
            outlined
            dense
          >
            <template #item="{props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.raw.icon" />
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="ziel"
            v-model:search="autoCompleteSearchValue"
            class="select"
            label="Zielort"
            :items="locations"
            item-title="name"
            item-value="name"
            prepend-icon="mdi-map-marker"
            outlined
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
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-btn
            class="button"

            rounded
            @click="searchRides"
          >
            Fahrten suchen
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="fahrten.length">
        <v-col

          cols="12"
        >
          <v-card
            v-for="fahrt in fahrten"
            :key="fahrt.id_fahrt"
            class="mb-4"
          >
            <v-card-title>
              Fahrt von {{ fahrt.start }} → {{ fahrt.ziel }}
            </v-card-title>
            <v-card-subtitle>
              Datum: {{ fahrt.datum }} | Uhrzeit: {{ fahrt.zeit }}
            </v-card-subtitle>
            <v-card-text>
              <p>Plätze verfügbar: {{ fahrt.anzahl_mitfahrer }}</p>
              <p>Erstellt von: {{ fahrt.created_by }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                class="btn-request"
                rounded
                border
                @click="anfrageStellen(fahrt.id_fahrt)"
              >
                Anfragen
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12">
          <v-alert
            type="info"
            text
          >
            Keine Fahrten gefunden
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>

import { useStore } from "@/stores/snackbar";
import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";
import setupRealtime from "@/services/realtimeListener";


export default {

  data() {
    return {
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
      try {
        
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

    async anfrageStellen(fahrtId) {
      const { error } = await supabase.from("anfragen").insert({
        fahrt_id: fahrtId,
        anfrager: this.user.username, // Der angemeldete Benutzer
        status: "ausstehend",
        created_by: null, // Wird im Trigger gesetzt
        marked_as: "ungelesen",
      });

      if (!error) {
        this.store.showSnackbar({
          message: "Anfrage erfolgreich gesendet!",
          color: "rgba(47, 96, 36, 0.274)",

        });
      } else {
        this.store.showSnackbar({
          message: "Fehler beim Senden der Anfrage.",
          color: "green",
          

        });
      }
    },
  }
}
</script>

<style scoped>

.button{
  display: flex;
  justify-content: center;
  align-items: center;
  margin:auto;
  margin-top: 50px;
  padding: 30px;
  background-color: #2f602446;
}

.btn-request{
  display: flex;
  border-color:rgba(47, 96, 36, 0.274) ;
  text-align : right;
  padding-left : 9px;
  margin-left : 640px;
  margin-top: -40px;
  color : rgba(47, 96, 36, 0.58);
  height : 40px;
  max-height : 400px;
  color : rgba(59, 68, 44, 0.87);
  font-size : 15px;
}

.select{
margin:auto;
color : rgba(35, 50, 26, 0.87);
}

</style>
