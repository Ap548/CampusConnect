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
            label="Startort"
            :items="locations"
            :item-props="itemProps"
            item-value="name"
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="ziel"
            label="Zielort"
            :items="locations"
            item-value="name"
            :item-props="itemProps"
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-btn
            color="primary"
            class="animated-btn"
            @click="searchRides"
          >
            Fahrten suchen
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="fahrten.length">
        <v-col cols="12">
          <v-card
            v-for="fahrt in fahrten"
            :key="fahrt.id_fahrt"
            class="mb-4 fade-in"
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
                color="primary"
                class="animated-btn"
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
            class="fade-in"
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
        { name: "Universität Bayreuth", id: 1, icon: "mdi-account-school-outline" },
        { name: "Campus Kulmbach", id: 2, icon: "mdi-account-school-outline" },
        { name: "ZOH", id: 3, icon: "mdi-bus-outline" },
        { name: "Hauptbahnhof Bayreuth", id: 4, icon: "mdi-train-outline" },
        { name: "Bahnhof Kulmbach", id: 5, icon: "mdi-train-outline" },
        { name: "Studi am Roten Hügel", id: 6, icon: "mdi-office-building-outline" },
      ],
      start: "",
      ziel: "",
      fahrten: [],
      user: null,
      store: useStore(),
    };
  },
  async mounted() {
    this.user = await SessionManager.getUser();
    setupRealtime(this.store, this.fetchFahrten);
  },
  methods: {
    itemProps(location) {
      return { title: location.name, icon: location.icon };
    },
    async searchRides() {
      try {
        const { data, error } = await supabase
          .from("fahrten")
          .select("*")
          .eq("start", this.start)
          .eq("ziel", this.ziel)
          .order("datum", { ascending: true });

        if (error) throw error;
        this.fahrten = data;
      } catch (error) {
        console.error("Fehler beim Abrufen der Fahrten:", error);
      }
    },
    async anfrageStellen(fahrtId) {
      try {
        const { error } = await supabase.from("anfragen").insert({
          fahrt_id: fahrtId,
          anfrager: this.user.username,
          status: "ausstehend",
          marked_as: "ungelesen",
        });
        if (!error) {
          this.store.showSnackbar({ message: "Anfrage erfolgreich gesendet!", color: "green" });
        } else {
          throw error;
        }
      } catch (error) {
        this.store.showSnackbar({ message: "Fehler beim Senden der Anfrage."+error, color: "red" });
      }
    },
  },
};
</script>

<style>
.animated-btn {
  transition: transform 0.2s ease-in-out;
}
.animated-btn:hover {
  transform: scale(1.05);
}
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
