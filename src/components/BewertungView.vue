<script>
  import { supabase } from '@/Clients/supabaseClient';
  import { SessionManager } from '../Manager/sessionManager';
  
  
  export default {
    data() {
      return {
        ratings: {
          pünktlichkeit: 0,
          zuverlässigkeit: 0,
          verhalten: 0,
        },
        user: null,
      };
    },
    computed: {
      // Berechne die Gesamtbewertung und runde auf eine Nachkommastelle
      overallRating() {
        const total =
          (this.ratings.pünktlichkeit +
            this.ratings.zuverlässigkeit +
            this.ratings.verhalten) /
          3;
        return total.toFixed(1); // Rundet auf eine Nachkommastelle
      },
    },
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
  
        try {
          const { data, error } = await supabase.from('ratings').insert([
            {
              verfasser: this.user.username,
              pünktlichkeit: this.ratings.pünktlichkeit,
              zuverlässigkeit: this.ratings.zuverlässigkeit,
              verhalten: this.ratings.verhalten,
              gesamt: parseFloat(this.overallRating) // Speichere die gerundete Gesamtbewertung
  
            },
          ]);
  
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
        <div class="categories">
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
  
  
  