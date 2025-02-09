<template>
  <v-card
    class="mx-auto"
    width="400"
  >
    <v-card-title class="text-h5">
      Bewerte deine Fahrt
    </v-card-title>
    <v-card-text>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-else class="categories">
        <div>
          <p>Pünktlichkeit:</p>
          <v-rating
            v-model="ratings.pünktlichkeit"
            length="5"
            empty-icon="mdi-car-outline"
            full-icon="mdi-car"
            half-icon="mdi-car-half"
            half-increments
            hover
            color="rgba(47, 96, 36, 0.613)"
            density="comfortable"
          />
        </div>

        <div>
          <p>Zuverlässigkeit:</p>
          <v-rating
            v-model="ratings.zuverlässigkeit"
            length="5"
            empty-icon="mdi-car-outline"
            full-icon="mdi-car"
            half-icon="mdi-car-half"
            half-increments
            hover
            color="rgba(47, 96, 36, 0.613)"
            density="comfortable"
          />
        </div>
        <div>
          <p>Verhalten:</p>
          <v-rating
            v-model="ratings.verhalten"
            length="5"
            empty-icon="mdi-car-outline"
            full-icon="mdi-car"
            half-icon="mdi-car-half"
            half-increments
            hover
            color="rgba(47, 96, 36, 0.613)"
            density="comfortable"
          />
        </div>
        <div />
        <p><strong>Gesamtbewertung:</strong> {{ overallRating }}</p>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-if="!errorMessage"
        class="buttons"
        append-icon="mdi-check-circle"
        color="rgba(47, 96, 36, 0.613)"
        rounded
        variant="tonal"
        @click="submitRating"
      >
        Abschicken
      </v-btn>
      <v-btn
        class="buttons"
        append-icon="mdi-close-circle-outline"
        rounded
        color="rgba(168, 64, 43, 0.548)"
        variant="tonal"
        @click="close"
      >
        Schließen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { supabase } from '@/Clients/supabaseClient';
import { SessionManager } from '../Manager/sessionManager';

export default {
  props: {
    fahrtStatus: {
      type: String,
      required: true
    },
    fahrtDatum: {
      type: String,
      required: true
    }
  },
  emits: ['rating-submitted', 'close'],
  data() {
    return {
      ratings: {
        pünktlichkeit: 0,
        zuverlässigkeit: 0,
        verhalten: 0,
      },
      user: null,
      errorMessage: '',
    };
  },
  computed: {
    overallRating() {
      const total =
        (this.ratings.pünktlichkeit +
          this.ratings.zuverlässigkeit +
          this.ratings.verhalten) /
        3;
      return total.toFixed(1);
    },
  },
  async created() {
    this.user = await SessionManager.getUser();
    if (!this.user) {
      console.error('Kein Benutzer angemeldet.');
    }
    this.checkFahrtStatus();
  },
  methods: {
    checkFahrtStatus() {
      const fahrtDatum = new Date(this.fahrtDatum);
      const now = new Date();

      if (this.fahrtStatus !== 'akzeptiert') {
        this.errorMessage = 'Nur akzeptierte Fahrten können bewertet werden.';
      } else if (fahrtDatum > now) {
        this.errorMessage = 'Du kannst nur vergangene Fahrten bewerten.';
      } else {
        this.errorMessage = ''; // Zurücksetzen, falls vorherige Fehler vorhanden waren
      }
    },
    async submitRating() {
      if (!this.user) {
        console.error('Benutzer nicht angemeldet. Bewertung kann nicht gespeichert werden.');
        return;
      }

      try {
        const { data, error } = await supabase.from('ratings').insert([
          {
            verfasser: this.user.username,
            pünktlichkeit: this.ratings.pünktlichkeit,
            zuverlässigkeit: this.ratings.zuverlässigkeit,
            verhalten: this.ratings.verhalten,
            gesamt: parseFloat(this.overallRating),
          },
        ]);

        if (error) {
          console.error('Fehler beim Speichern der Bewertung:', error);
          return;
        }

        console.log('Bewertung erfolgreich gespeichert:', data);
        this.$emit('rating-submitted');
      } catch (err) {
        console.error('Ein Fehler ist aufgetreten:', err);
      } finally {
        this.$emit('close');  // Immer schließen, unabhängig vom Erfolg
      }
    },
    close() {
      this.$emit('close');
    }
  },
};
</script>

<style scoped>
.mx-auto {
  margin: auto;
  margin-top: 280px;
  position: outline;
  box-shadow: rgba(47, 96, 36, 0.275) 0px 4px 20px;
  height: auto;
}

.text-h5 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 40px;
  margin-top: 30px;
  color: rgba(35, 50, 26, 0.87);
}

.categories {
  font-size: 18px;
  display: flex;
  flex-direction: column;
  color: rgba(35, 50, 26, 0.87);
}

.buttons {
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.error-message {
  color: red;
  text-align: center;
  margin-bottom: 20px;
}
</style>
