
<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
      >
        <v-card
          elevation="4"
          rounded="lg"
        >
          <v-card-item>
            <v-card-title class="text-h5 primary--text">
              <v-icon left>
                mdi-message-text
              </v-icon>Fahrten & Anfragen
            </v-card-title>
            <v-card-subtitle>
              Hier können Sie die Anfragen für Ihre Fahrten verwalten.
            </v-card-subtitle>
          </v-card-item>

          <v-tabs v-model="tab">
            <v-tab key="eigene">
              Eigene Fahrten
            </v-tab>
            <v-tab key="gesendet">
              Gesendete Anfragen
            </v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="eigene">
              <v-list v-if="fahrten.length">
                <v-list-item
                  v-for="fahrt in fahrten"
                  :key="fahrt.id_fahrt"
                  class="mb-2"
                  rounded="lg"
                >
                  <v-card
                    class="w-100"
                    elevation="2"
                    rounded="lg"
                  >
                    <v-card-item>
                      <v-card-title class="text-h6">
                        <v-icon left>
                          mdi-map-marker
                        </v-icon>{{ fahrt.start }} ➝ {{ fahrt.ziel }}
                      </v-card-title>
                      <v-card-subtitle>
                        <v-icon left>
                          mdi-calendar
                        </v-icon>{{ formatDate(fahrt.datum) }} um {{ formatTime(fahrt.zeit) }}
                      </v-card-subtitle>

                      <v-row
                        align="center"
                        justify="space-between"
                      >
                        <v-col cols="auto">
                          <div class="d-flex align-center">
                            <span class="mr-2">Anfragen:</span>
                            <v-chip
                              color="primary"
                              label
                              small
                            >
                              {{ angenommeneAnfragen(fahrt) }} / {{ fahrt.anzahl_mitfahrer }}
                            </v-chip>
                          </div>
                        </v-col>
                        <v-col cols="auto">
                          <v-chip
                            :color="freiePlaetze(fahrt) > 0 ? 'success' : 'error'"
                            label
                            small
                          >
                            {{ freiePlaetze(fahrt) }} Plätze frei
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-card-item>

                    <v-divider />

                    <v-list
                      v-if="fahrt.anfragen.length"
                      subheader
                    >
                      <v-list-item
                        v-for="anfrage in fahrt.anfragen"
                        :key="anfrage.id_anfrage"
                      >
                        <v-list-item-avatar color="grey lighten-1">
                          <v-icon>mdi-account</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>
                            <a
                              href="#"
                              @click.prevent="openEmail(anfrage.anfragerEmail)"
                            >
                              {{ anfrage.anfrager }}
                            </a>
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip
                              :color="statusColor(anfrage.status)"
                              label
                              small
                            >
                              {{ anfrage.status }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn
                            v-if="anfrage.status !== 'ausstehend'"
                            icon
                            color="info"
                            @click="resetAnfrageStatus(anfrage.id_anfrage, fahrt)"
                          >
                            <v-icon>mdi-undo</v-icon>
                          </v-btn>
                          <v-btn
                            v-if="anfrage.status === 'ausstehend'"
                            icon
                            color="success"
                            @click="updateAnfrageStatus(anfrage.id_anfrage, 'akzeptiert', fahrt)"
                          >
                            <v-icon>mdi-check</v-icon>
                          </v-btn>
                          <v-btn
                            v-if="anfrage.status === 'ausstehend'"
                            icon
                            color="error"
                            @click="updateAnfrageStatus(anfrage.id_anfrage, 'abgelehnt', fahrt)"
                          >
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <v-alert
                        outlined
                        type="info"
                        icon="mdi-information-outline"
                      >
                        Keine Anfragen vorhanden.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-list-item>
              </v-list>
              <v-card-text v-else>
                <v-alert
                  v-if="loading"
                  color="info"
                  icon="mdi-clock-outline"
                >
                  Lade Daten...
                </v-alert>
                <v-alert
                  v-else-if="errorMessage"
                  color="error"
                  icon="mdi-alert-circle-outline"
                >
                  {{ errorMessage }}
                </v-alert>
                <v-alert
                  v-else
                  outlined
                  type="warning"
                  icon="mdi-exclamation-thick"
                >
                  Keine Fahrten gefunden.
                </v-alert>
              </v-card-text>
            </v-window-item>

            <v-window-item value="gesendet">
              <v-list v-if="gesendeteAnfragen.length">
                <v-list-item
                  v-for="anfrage in gesendeteAnfragen"
                  :key="anfrage.id_anfrage"
                  class="mb-2"
                  rounded="lg"
                  @click="handleGesendeteAnfrageClick(anfrage)"
                >
                  <v-card
                    class="w-100"
                    elevation="2"
                    rounded="lg"
                  >
                    <v-card-item>
                      <v-card-title class="text-h6">
                        <v-icon left>
                          mdi-map-marker
                        </v-icon>{{ anfrage.fahrt.start }} ➝ {{ anfrage.fahrt.ziel }}
                      </v-card-title>
                      <v-card-subtitle>
                        Anfragen von:
                        <a
                          href="#"
                          @click.prevent="openEmail(anfrage.fahrtErstellerEmail)"
                        >
                          {{ anfrage.fahrt.created_by }}
                        </a>
                      </v-card-subtitle>
                      <v-card-text>
                        Status:
                        <v-chip
                          :color="statusColor(anfrage.status)"
                          label
                          small
                        >
                          {{ anfrage.status }}
                        </v-chip>
                      </v-card-text>
                    </v-card-item>
                  </v-card>
                </v-list-item>
              </v-list>
              <v-card-text v-else>
                <v-alert
                  outlined
                  type="info"
                  icon="mdi-information-outline"
                >
                  Keine gesendeten Anfragen.
                </v-alert>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/Clients/supabaseClient";
import gsap from "gsap";
import { SessionManager } from "@/Manager/sessionManager";
import { useRouter } from "vue-router";

const router = useRouter();

const tab = ref("eigene");
const fahrten = ref([]);
const gesendeteAnfragen = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const user = await SessionManager.getUser();

// Fahrten & Anfragen laden
const loadFahrtenMitAnfragen = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    let { data, error } = await supabase
      .from("fahrten")
      .select(
        `id_fahrt, start, ziel, datum, zeit, anzahl_mitfahrer, created_by,
        anfragen:anfragen(id_anfrage, anfrager, status)`
      )
      .eq("created_by", user.username)
      .order("datum", { ascending: true });

    if (error) {
      console.error("Fehler beim Laden der Fahrten:", error);
      errorMessage.value = "Daten konnten nicht geladen werden." + error.message;
      return;
    }

    // email vom Anfrager abfragen
    for (const fahrt of data) {
      if (fahrt.anfragen && fahrt.anfragen.length > 0) {
        for (const anfrage of fahrt.anfragen) {
          try {
            const { data: clientData, error: clientError } = await supabase
              .from("clients")
              .select("email")
              .eq("username", anfrage.anfrager)
              .single();

            if (clientError) {
              console.error(`Error fetching email for ${anfrage.anfrager}:`, clientError);
              anfrage.anfragerEmail = 'Email nicht gefunden';
            } else {
              anfrage.anfragerEmail = clientData?.email || 'Email nicht gefunden';
            }
          } catch (e) {
            console.error("Error fetching email:", e);
            anfrage.anfragerEmail = 'Email nicht gefunden';
          }
        }
      }
    }

    fahrten.value = data;
  } catch (error) {
    errorMessage.value = "Daten konnten nicht geladen werden." + error;
  } finally {
    loading.value = false;
  }
};

// Gesendete Anfragen laden
const loadGesendeteAnfragen = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await supabase
      .from("anfragen")
      .select(
        `id_anfrage, status, fahrt:fahrten(id_fahrt, start, ziel, datum, zeit, created_by)`
      )
      .eq("anfrager", user.username);

    if (error) {
      console.error("Error loading gesendete Anfragen:", error);
      errorMessage.value = "Daten konnten nicht geladen werden." + error.message;
      return;
    }

    // email vom Ersteller der Fahrt abfragen
    for (const anfrage of data) {
      try {
        const { data: creatorData, error: creatorError } = await supabase
          .from("clients")
          .select("email")
          .eq("username", anfrage.fahrt.created_by)
          .single();

        if (creatorError) {
          console.error(`Error fetching creator email for ${anfrage.fahrt.created_by}:`, creatorError);
          anfrage.fahrtErstellerEmail = 'Email nicht gefunden';
        } else {
          anfrage.fahrtErstellerEmail = creatorData?.email || 'Email nicht gefunden';
        }
      } catch (e) {
        console.error("Error fetching creator email:", e);
        anfrage.fahrtErstellerEmail = 'Email nicht gefunden';
      }
    }

    gesendeteAnfragen.value = data;
  } catch (error) {
    errorMessage.value = "Daten konnten nicht geladen werden." + error;
  } finally {
    loading.value = false;
  }
};

// Anfrage annehmen oder ablehnen
const updateAnfrageStatus = async (id_anfrage, neuerStatus, fahrt) => {
  try {
    const { error } = await supabase
      .from("anfragen")
      .update({ status: neuerStatus })
      .eq("id_anfrage", id_anfrage);

    if (error) throw error;

    // Wenn angenommen -> Zähler animieren
    animateCounter(fahrt);

    // Daten neu laden
    await loadFahrtenMitAnfragen();
  } catch (error) {
    errorMessage.value = "Status konnte nicht geändert werden." + error;
  }
};

// Status der Anfrage zurücksetzen
const resetAnfrageStatus = async (id_anfrage) => {
  try {
    const { error } = await supabase
      .from("anfragen")
      .update({ status: "ausstehend" })
      .eq("id_anfrage", id_anfrage);

    if (error) throw error;

    // Daten neu laden
    await loadFahrtenMitAnfragen();
  } catch (error) {
    errorMessage.value = "Status konnte nicht zurückgesetzt werden." + error;
  }
};

//  Realtime-Listener für neue Anfragen & Updates
const subscribeToAnfragenUpdates = () => {
  supabase
    .channel("anfragen")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "anfragen" },
      async () => {
        await loadFahrtenMitAnfragen();
        await loadGesendeteAnfragen();
      }
    )
    .subscribe();
};

//  Animierter Counter für freie Plätze
const animateCounter = (fahrt) => {
  const counterElement = document.querySelector(`#counter-${fahrt.id_fahrt}`);
  if (counterElement) {
    gsap.fromTo(counterElement, { scale: 1.3 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  }
};

//  Berechnet die Anzahl der noch freien Plätze
const freiePlaetze = (fahrt) => {
  const angenommene = fahrt.anfragen.filter(a => a.status === "akzeptiert").length;
  return Math.max(0, fahrt.anzahl_mitfahrer - angenommene); // Verhindert negative Werte
};

//  Berechnet die Anzahl der angenommenen Anfragen
const angenommeneAnfragen = (fahrt) => {
  return fahrt.anfragen.filter(a => a.status === "akzeptiert").length;
};

//  Gibt die Farbe basierend auf dem Status zurück, ggf. noch anpassen
const statusColor = (status) => {
  switch (status) {
    case "ausstehend":
      return "warning";
    case "akzeptiert":
      return "success";
    case "abgelehnt":
      return "error";
    default:
      return "primary";
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("de-DE");
};

const formatTime = (time) => {
  return time.slice(0, 5); // da Format hh:mm:ss ist
};

//  Navigiert zum Profil des Anfragers
const goToUserProfile = async (username) => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('clients')
            .select('username')
            .eq('username', username)
            .single();

        if (userError) {
            console.error("Error fetching user profile:", userError);

            return;
        }

        if (userData) {
            router.push({ path: `/profile/${username}` });
        } else {
            console.warn("User profile not found");

        }
    } catch (error) {
        console.error("Unexpected error:", error);

    }
};

const handleGesendeteAnfrageClick = (anfrage) => {
  if (anfrage.status === "abgelehnt") {
    router.push({
      name: "alternativefahrten",
      query: { start: anfrage.fahrt.start, ziel: anfrage.fahrt.ziel },
    });
  } else {
    goToUserProfile(anfrage.fahrt.created_by);
  }
};

//  Öffnet das Standard-E-Mail-Programm
const openEmail = (email) => {
  window.location.href = `mailto:${email}`;
};

onMounted(() => {
  loadFahrtenMitAnfragen();
  loadGesendeteAnfragen();
  subscribeToAnfragenUpdates();
});

onUnmounted(() => {
  supabase.channel("anfragen").unsubscribe();
});
</script>

<style scoped>
/* Modernes Design */
.v-card {
  transition: all 0.3s ease-in-out;
  border-radius: 12px;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.v-chip {
  font-size: 0.8rem;
}

a {
  text-decoration: none;
  color: inherit;
}

a:hover {
  text-decoration: underline;
}
</style>
