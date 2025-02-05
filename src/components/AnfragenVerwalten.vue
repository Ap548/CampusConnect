<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/Clients/supabaseClient";
import gsap from "gsap";


const fahrten = ref([]);
const loading = ref(false);
const errorMessage = ref("");

// 🚀 Fahrten & Anfragen laden
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
      .order("datum", { ascending: true });

    if (error) throw error;

    fahrten.value = data;
  } catch (error) {
    errorMessage.value = "Daten konnten nicht geladen werden." +error;
  } finally {
    loading.value = false;
  }
};

// 🚀 Anfrage annehmen oder ablehnen
const updateAnfrageStatus = async (id_anfrage, neuerStatus, fahrt) => {
  try {
    const { error } = await supabase
      .from("anfragen")
      .update({ status: neuerStatus })
      .eq("id_anfrage", id_anfrage);

    if (error) throw error;

    // Wenn angenommen -> Zähler animieren
    if (neuerStatus === "akzeptiert") animateCounter(fahrt);

    // Daten neu laden
    await loadFahrtenMitAnfragen();
  } catch (error) {
    errorMessage.value = "Status konnte nicht geändert werden."+error;
  }
};

// 🚀 Realtime-Listener für neue Anfragen & Updates
const subscribeToAnfragenUpdates = () => {
  supabase
    .channel("anfragen")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "anfragen" },
      async () => {
        await loadFahrtenMitAnfragen();
      }
    )
    .subscribe();
};

// 🚀 Animierter Counter für freie Plätze
const animateCounter = (fahrt) => {
  const counterElement = document.querySelector(`#counter-${fahrt.id_fahrt}`);
  if (counterElement) {
    gsap.fromTo(counterElement, { scale: 1.3 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  }
};

// 🚀 Berechnet die Anzahl der **noch freien Plätze**
const freiePlaetze = (fahrt) => {
  const angenommene = fahrt.anfragen.filter(a => a.status === "akzeptiert").length;
  return fahrt.anzahl_mitfahrer - angenommene;
};

// ⏳ Lade Daten beim Mounten
onMounted(() => {
  loadFahrtenMitAnfragen();
  subscribeToAnfragenUpdates();
});

// 🛑 Abo entfernen beim Verlassen
onUnmounted(() => {
  supabase.channel("anfragen").unsubscribe();
});
</script>

<template>
  <div class="container">
    <h1>🚗 Fahrten & Anfragen</h1>

    <p
      v-if="loading"
      class="loading"
    >
      Lade Daten...
    </p>
    <p
      v-if="errorMessage"
      class="error"
    >
      {{ errorMessage }}
    </p>

    <!-- Fahrten mit Anfragen -->
    <div v-if="fahrten.length">
      <div
        v-for="fahrt in fahrten"
        :key="fahrt.id_fahrt"
        class="fahrt-card"
      >
        <div class="fahrt-header">
          <h2>📍 {{ fahrt.start }} ➝ {{ fahrt.ziel }}</h2>
          <p>{{ fahrt.datum }} | {{ fahrt.zeit }}</p>
        </div>

        <!-- Animierter Counter für freie Plätze -->
        <div class="counter-container">
          <p>Freie Plätze:</p>
          <span
            :id="'counter-' + fahrt.id_fahrt"
            class="counter"
          >
            {{ freiePlaetze(fahrt) }}
          </span>
        </div>

        <!-- Anfragen-Liste -->
        <div
          v-if="fahrt.anfragen.length"
          class="anfragen-list"
        >
          <h3>🛎️ Anfragen:</h3>
          <div
            v-for="anfrage in fahrt.anfragen"
            :key="anfrage.id_anfrage"
            class="anfrage-box"
          >
            <span class="anfrager-name">👤 {{ anfrage.anfrager }}</span>
            <span
              class="status"
              :class="anfrage.status"
            >{{ anfrage.status }}</span>

            <div class="buttons">
              <button
                v-if="anfrage.status === 'ausstehend'"
                class="accept"
                @click="updateAnfrageStatus(anfrage.id_anfrage, 'akzeptiert', fahrt)"
              >
                ✅ Akzeptieren
              </button>
              <button
                v-if="anfrage.status === 'ausstehend'"
                class="decline"
                @click="updateAnfrageStatus(anfrage.id_anfrage, 'abgelehnt', fahrt)"
              >
                ❌ Ablehnen
              </button>
            </div>
          </div>
        </div>
        <p
          v-else
          class="no-anfragen"
        >
          Keine Anfragen vorhanden.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

/* Header */
h1 {
  text-align: center;
  margin-bottom: 20px;
}

/* Lade- & Fehler-Nachricht */
.loading, .error {
  text-align: center;
  font-size: 1.2rem;
  margin: 10px 0;
}

.error {
  color: red;
}

/* Fahrten-Card */
.fahrt-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

/* Fahrten-Header */
.fahrt-header h2 {
  font-size: 1.2rem;
  margin: 0;
}

.fahrt-header p {
  color: #666;
  font-size: 0.9rem;
}

/* Animierter Counter */
.counter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px 0;
}

.counter {
  background: #007bff;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 1.3rem;
}

/* Anfragen-Liste */
.anfragen-list {
  margin-top: 10px;
}

.anfrage-box {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
}

.anfrager-name {
  font-weight: bold;
}

.status {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.ausstehend {
  background: #ffc107;
}

.akzeptiert {
  background: #28a745;
  color: white;
}

.abgelehnt {
  background: #dc3545;
  color: white;
}

/* Buttons */
.buttons button {
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.accept {
  background: #28a745;
  color: white;
}

.decline {
  background: #dc3545;
  color: white;
}
</style>
