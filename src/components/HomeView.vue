<script>
import { supabase } from "../Clients/supabaseClient";
import { SessionManager } from "../Manager/sessionManager";

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
        { name: "Studi Jakobsstraße", id: 7, icon: "mdi-office-building-outline" },
        { name: "Studi Apart", id: 8, icon: "mdi-office-building-outline" },
        { name: "Studi Storchennest", id: 9, icon: "mdi-office-building-outline" },
        { name: "Uni Apart", id: 10, icon: "mdi-office-building-outline" },
        { name: "Studiocomfort", id: 11, icon: "mdi-office-building-outline" },
      ],
      start: "",
      ziel: "",
      fahrten: [],
      overlay: false,
      selectedUser: null,


    };
  },

  async mounted() {
    try {
      const  user  = await SessionManager.getUser();
      if (user) {
        this.user = user;
        console.log("Benutzer erfolgreich geladen:", this.user);

        // Supabase-Subscription für Benachrichtigungen einrichten
        supabase
          .channel("messages")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "anfragen",
              filter: `anfrager=eq.${this.user.username}`,
            },
            (payload) => {
              const { status } = payload.new;
              if (status === "akzeptiert") {

                alert("Ihr Antrag wurde akzeptiert!");
              } else if (status === "abgelehnt") {
                alert("Ihr Antrag wurde abgelehnt.");
              }
            }
          )
          .subscribe();
      } else {
        console.warn("Kein Benutzer gefunden.");
      }
    } catch (error) {
      console.error("Fehler beim Laden des Benutzers:", error);
    }
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
        const { data, error } = await supabase
          .from("fahrten")
          .select("*")
          .eq("start", this.start)
          .eq("ziel", this.ziel)
          .order("datum", { ascending: true });

        if (error) {
          console.error("Fehler beim Abrufen der Fahrten:", error);
          return;
        }

        this.fahrten = data;
      } catch (error) {
        console.error("Ein Fehler ist aufgetreten:", error);
      }
    },

    async openRequestOverlay(fahrt) {

      try {

        this.selectedUser = fahrt.created_by;

        // Anfrage an den Ersteller der Fahrt senden
        const { data, error } = await supabase.from("anfragen").insert({
          fahrt_id: fahrt.id_fahrt,
          anfrager: this.user.username, // Username des eingeloggten Benutzers
          created_by: fahrt.created_by,
          status: "ausstehend",
        });

        if (error) {
          console.error("Fehler beim Senden der Anfrage:", error);
          alert("Es gab ein Problem beim Senden Ihrer Anfrage.");
        } else {
          console.log("Anfrage erfolgreich gesendet:", data);
          this.overlay = true;
        }
      } catch (error) {
        console.error("Fehler beim Senden der Anfrage:", error);
      }
    },

    closeOverlay() {
      this.overlay = false;
      this.selectedUser = null;
    },

  },
};
</script>

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
          <v-col cols="12">
            <v-btn
              color="primary"
              @click="searchRides"
            >
              Fahrten suchen
            </v-btn>
          </v-col>
        </v-row>
  
        <v-row v-if="fahrten.length">
          <v-col
            v-for="fahrt in fahrten"
            :key="fahrt.id_fahrt"
            cols="12"
          >
            <v-card outlined>
              <v-card-title>
                <div>
                  <strong>Abfahrtsort:</strong> {{ fahrt.start }}
                  <br>
                  <strong>Zielort:</strong> {{ fahrt.ziel }}
                  <br>
                  <strong>Datum:</strong> {{ fahrt.datum }}
                  <br>
                  <strong>Uhrzeit:</strong> {{ fahrt.zeit }}
                </div>
              </v-card-title>
              <v-card-actions>
                <v-btn
                  color="secondary"
                  @click="openRequestOverlay(fahrt)"
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
  
        <!-- Overlay -->
        <v-dialog
          v-model="overlay"
          max-width="400"
        >
          <v-card>
            <v-card-title>
              <v-avatar size="64">
                <img
                  src="../assets/CC_logo.png"
                  alt="User Avatar"
                >
              </v-avatar>
              <span class="ml-3">{{ selectedUser }}</span>
            </v-card-title>
            <v-card-text>
              <p>{{ selectedUser }} wurde benachrichtigt</p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                text
                @click="closeOverlay"
              >
                Schließen
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </div>
  </template>
  