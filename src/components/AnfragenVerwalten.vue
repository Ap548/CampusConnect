//Verwaltung der Anfragen, Design muss dringend geändert werden 

<template>
  <v-container>
    <v-card>
      <v-card-title>Anfragen verwalten</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="anfrage in anfragen"
            :key="anfrage.id_anfrage"
          >
            <v-list-item-content>
              <v-list-item-title>
                Anfrage von: {{ anfrage.anfrager }} für Fahrt nach {{ anfrage.ziel }}
              </v-list-item-title>
              <v-list-item-subtitle>Status: {{ anfrage.status }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                color="green"
                @click="updateStatus(anfrage.id_anfrage, 'akzeptiert')"
              >
                Annehmen
              </v-btn>
              <v-btn
                color="red"
                @click="updateStatus(anfrage.id_anfrage, 'abgelehnt')"
              >
                Ablehnen
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";
import { sendNotification } from "@/services/realtimeListener";



export default {
  setup() {
    const anfragen = ref([]);
    let currentUser = ref(null);
    let subscription = null; // Speichert die Subscription-Referenz

    const fetchAnfragen = async () => {
      currentUser.value = await SessionManager.getUser();
      if (!currentUser.value) return;

      const { data, error } = await supabase
        .from("anfragen")
        .select("*, fahrten(ziel)")
        .eq("fahrten.created_by", currentUser.value.username)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fehler beim Abrufen der Anfragen:", error);
      } else {
        anfragen.value = data;
      }
    };



    const updateStatus = async (anfrageId, status) => {
      const { error } = await supabase
        .from("anfragen")
        .update({ status, status_update: new Date().toISOString() })
        .eq("id_anfrage", anfrageId);

      if (error) {
        console.error("Fehler beim Aktualisieren des Status:", error);
      } else {
        await sendNotification(anfrageId, status);
        await fetchAnfragen(); // Manuelles Update nach Statusänderung
      }
    };

    // Echtzeit-Listener einrichten
    const subscribeToAnfragen = () => {
      subscription = supabase
        .channel("anfragen-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "anfragen" },
          (payload) => {
            console.log("Änderung in 'anfragen' erhalten:", payload);
            fetchAnfragen(); // Neu laden, wenn eine Änderung erkannt wird
          }
        )
        .subscribe();
    };

    onMounted(() => {
      fetchAnfragen();
      subscribeToAnfragen();
    });

    onUnmounted(() => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    });

    return { anfragen, updateStatus};
  },
};
</script>

