<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
      >
        <v-card class="pa-4">
          <!-- Avatar und Benutzerinformationen -->
          <v-row
            align="center"
            justify="center"
          >
            <v-col
              cols="12"
              sm="4"
              class="text-center"
            >
              <v-avatar
                size="120"
                class="mb-4"
              >
                <v-img :src="profile.avatar || defaultAvatar" />
              </v-avatar>
              <v-file-input
                v-model="avatarFile"
                accept="image/*"
                label="Avatar ändern"
                prepend-icon="mdi-camera"
                hide-input
                class="mt-2"
                @change="uploadAvatar"
              />
            </v-col>
            <v-col
              cols="12"
              sm="8"
            >
              <h2 class="text-h4 mb-2">
                {{ profile.username }}
              </h2>
              <v-rating
                :model-value="profile.overallRating"
                color="amber"
                half-increments
                readonly
                size="small"
              />
              <p class="text-subtitle-1 mt-2">
                Gesamtbewertung: {{ profile.overallRating.toFixed(1) }}
              </p>
              <v-textarea
                v-model="profile.bio"
                label="Über mich"
                rows="3"
                auto-grow
                outlined
                dense
                @blur="updateBio"
              />
              <v-btn
                color="primary"
                @click="openRatingDialog"
              >
                Bewertung abgeben
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Angelegte Fahrten -->
        <v-card class="mt-6 pa-4">
          <h3 class="text-h5 mb-4">
            Meine Fahrten
          </h3>
          <v-row>
            <v-col
              v-for="fahrt in userFahrten"
              :key="fahrt.id_fahrt"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                elevation="2"
                class="h-100"
              >
                <v-card-title class="text-h6">
                  {{ fahrt.start }} → {{ fahrt.ziel }}
                </v-card-title>
                <v-card-subtitle>
                  {{ formatDate(fahrt.datum) }} um {{ formatTime(fahrt.zeit) }}
                </v-card-subtitle>
                <v-card-text>
                  <v-icon
                    small
                    class="mr-1"
                  >
                    mdi-account-multiple
                  </v-icon>
                  Plätze verfügbar: {{ fahrt.anzahl_mitfahrer }}
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    text
                    color="primary"
                    @click="openEditDialog(fahrt)"
                  >
                    Bearbeiten
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gemeinsamer Edit Dialog -->
    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card
        v-if="editedFahrt"
        max-width="400"
      >
        <v-card-title>Fahrt bearbeiten</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedFahrt.start"
            label="Start"
            required
          />
          <v-text-field
            v-model="editedFahrt.ziel"
            label="Ziel"
            required
          />
          <v-text-field
            v-model="editedFahrt.datum"
            label="Datum"
            required
          />
          <v-text-field
            v-model="editedFahrt.zeit"
            label="Zeit"
            required
          />
          <v-text-field
            v-model.number="editedFahrt.anzahl_mitfahrer"
            label="Verfügbare Plätze"
            type="number"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            @click="saveFahrt"
          >
            Speichern
          </v-btn>
          <v-btn @click="dialog = false">
            Abbrechen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="ratingDialog"
    >
      <BewertungView
        class="rating"
        @rating-submitted="closeRatingDialog"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "@/assets/CC_logo.png";
import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";
import setupRealtime from "@/services/realtimeListener";
import { useRouter } from 'vue-router';
import BewertungView from "./BewertungView.vue";

const router = useRouter();
const profile = ref({
  avatar: null,
  username: null,
  overallRating: 0,
  bio: "",
});
const userFahrten = ref([]);
const avatarFile = ref(null);
const dialog = ref(false);
const editedFahrt = ref(null);
const ratingDialog = ref(false);

const user = await SessionManager.getUser();

const loadProfile = async () => {
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("username", user.username)
    .single();

  if (clientError) {
    console.error("Error fetching user info:", clientError);
    return;
  }

  profile.value = {
    username: clientData.username,
    bio: clientData.bio || "",
    avatar: clientData.avatar?.url || defaultAvatar,
    overallRating: 0,
  };

  const { data: ratings, error: ratingError } = await supabase
    .from("ratings")
    .select("gesamt")
    .eq("verfasser", user.username);

  if (ratingError) {
    console.error("Error fetching ratings:", ratingError);
  } else if (ratings && ratings.length > 0) {
    const sum = ratings.reduce((total, r) => total + r.gesamt, 0);
    profile.value.overallRating = sum / ratings.length;
  }
};

const loadFahrten = async () => {
  const { data, error } = await supabase
    .from("fahrten")
    .select("*")
    .eq("created_by", user.username);

  if (error) {
    console.error("Error fetching fahrten:", error);
  } else {
    userFahrten.value = data;
  }
};

const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  const file = avatarFile.value;
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.username}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("clients")
    .update({ avatar: { url: publicUrl } })
    .eq("username", user.username);

  if (updateError) {
    console.error("Error updating avatar URL:", updateError);
  } else {
    profile.value.avatar = publicUrl;
  }
};

const updateBio = async () => {
  const { error } = await supabase
    .from("clients")
    .update({ bio: profile.value.bio })
    .eq("username", user.username);

  if (error) {
    console.error("Error updating bio:", error);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE');
};

const formatTime = (time) => {
  return time.slice(0, 5); // Assumes time is in HH:MM:SS format
};

const openEditDialog = (fahrt) => {
  editedFahrt.value = { ...fahrt };
  dialog.value = true;
};
const openRatingDialog = () => {
    ratingDialog.value = true;
};
const closeRatingDialog = () => {
    ratingDialog.value = false;
};


const saveFahrt = async () => {
  if (!editedFahrt.value) return;

  const { data, error } = await supabase
    .from('fahrten')
    .update(editedFahrt.value)
    .eq('id_fahrt', editedFahrt.value.id_fahrt);

  if (error) {
    console.error("Fehler beim Aktualisieren der Fahrt:", error);
  } else {
    console.log("Fahrt erfolgreich aktualisiert:", data);
    dialog.value = false;
    await loadFahrten(); // Aktualisiere die Fahrtenliste
  }
};

const updateFahrten = async () => {
  await loadFahrten();
};

onMounted(() => {
  loadProfile();
  loadFahrten();
  setupRealtime( router, updateFahrten);
});
</script>

<style scoped>
.v-card {
  transition: all 0.3s;
}
.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.rating{
  margin: auto;
}
</style>
