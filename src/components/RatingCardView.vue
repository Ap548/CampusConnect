<script>
import { supabase } from '@/Clients/supabaseClient';
import { SessionManager } from '../Clients/sessionManager';


export default {
  data() {
    return {
      ratings: {
        punctuality: 0,
        reliability: 0,
        behavior: 0,
      },
      user: null,
    };
  },
  computed: {
    // Berechnet die Gesamtbewertung und rundet auf eine Nachkommastelle
    overallRating() {
      const total =
        (this.ratings.punctuality +
          this.ratings.reliability +
          this.ratings.behavior) /
        3;
      return total.toFixed(1); // Rundet auf eine Nachkommastelle
    },
  },
  // Hier wird der momentane Benutzer geladen
  async created() {
    this.user = await SessionManager.getUser();
    if (!this.user) {
      console.error('Kein Benutzer angemeldet.');
    }
  },
  methods: {
    async submitRating() { //TODO : Supabase verlinken
      if (!this.user) {
        console.error('Benutzer nicht angemeldet. Bewertung kann nicht gespeichert werden.');
        return;
      }
      // Hier wird die Bewertung in die Datenbank gespeichert 
      //TODO: Fahrten ID hinzufügen
      try {
        const { data, error } = await supabase.from('ratings').insert([
          {
            user_id: this.user.id,
            punctuality: this.ratings.punctuality,
            reliability: this.ratings.reliability,
            behavior: this.ratings.behavior,
            overall: parseFloat(this.overallRating) // Speichert die gerundete Gesamtbewertung

          },
        ]);
        
// Hier wird überprüft, ob ein Fehler aufgetreten ist: auf Inspect klicken und dann auf Console
        if (error) {
          console.error('Fehler beim Speichern der Bewertung:', error);
          return;
        }

        console.log('Bewertung erfolgreich gespeichert:', data);
      } catch (err) {
        console.error('Ein Fehler ist aufgetreten:', err);
      }
    },
  },
};
</script>


<style scoped>

.mx-auto {
    margin: auto;
    margin-top: 280px;
    height: auto;
  }
  .text-h5 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 40px;
    margin-top: 30px;
  }
.categories {
    font-size: 18px;
    display: flex;
    flex-direction: column;

  }
  .buttons {
    margin: auto;
    margin-top: 20px;
    margin-bottom: 20px;
    

  }
</style>

<template>
  <v-card
    class="mx-auto"
    width="400"
  >
    <v-card-title class="text-h5">
      Bewerte deine Fahrt
    </v-card-title>
    <v-card-text>
    <!-- Hier werden die Bewertungskategorien angezeigt -->
      <div class="categories">
        <div>
          <p>Pünktlichkeit:</p>
          <v-rating
            v-model="ratings.punctuality"
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
            v-model="ratings.reliability"
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
            v-model="ratings.behavior"
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
    <!-- Hier wird der Abschicken-Button angezeigt -->
    <v-card-actions>
      <v-btn
        class="buttons"
        append-icon="mdi-check-circle"
        color="rgba(47, 96, 36, 0.613)"
        rounded
        variant="tonal"
        @click="submitRating"
      >
        Abschicken
      </v-btn>
    </v-card-actions>
  </v-card>
</template>