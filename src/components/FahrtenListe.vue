// nicht wunder, dass die Suchfunktion hier nicht ist.
//HomeView und diese Komponente müssen kombiniert werden -> jetzt nur wegen der Snackbar

<template>
  <v-container>
    <h1>Willkommen zur Pendler-App</h1>

    <v-card
      v-for="fahrt in fahrten"
      :key="fahrt.id_fahrt"
      class="mb-4"
    >
      <v-card-title>
        Fahrt von {{ fahrt.start }} nach {{ fahrt.ziel }}
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
          @click="anfrageStellen(fahrt.id_fahrt)"
        >
          Anfragen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { useStore } from "@/stores/snackbar";
import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";
import setupRealtime from "@/services/realtimeListener";

export default {
  data() {
    return {
      fahrten: [], // Speichert die Liste der Fahrten
      user: null,
      store: useStore(),
    };
  },
  async mounted() {
    this.user = await SessionManager.getUser();
    await this.fetchFahrten();
    setupRealtime(this.store, this.fetchFahrten); // Echtzeit-Updates aktivieren
  },
  methods: {
    async fetchFahrten() {
      const { data, error } = await supabase
        .from("fahrten")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        this.fahrten = data;
      } else {
        console.error("Fehler beim Abrufen der Fahrten:", error);
      }
    },
    async anfrageStellen(fahrtId) {
      const { error } = await supabase.from("anfragen").insert({
        fahrt_id: fahrtId,
        anfrager: this.user.username, // Der angemeldete Benutzer
        status: "ausstehend",
        created_by: null, // Wird im Trigger (supabase) gesetzt
        marked_as: "ungelesen",
      });

      if (!error) {
        this.store.showSnackbar({
          message: "Anfrage erfolgreich gesendet!",
          color: "green",
        });
      } else {
        this.store.showSnackbar({
          message: "Fehler beim Senden der Anfrage.",
          color: "red",
        });
      }
    },
  },




};
</script>
