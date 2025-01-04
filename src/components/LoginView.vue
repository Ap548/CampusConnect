



<template>
  <v-form @submit.prevent="loginUser">
    <div class="icon">
      <v-avatar
        size="400"
      >
        <v-img
          class="image"
          alt="Logo"
          src="../assets/CC_logo.png"
        />
      </v-avatar>
    </div>
    <div class="container">
      <container>
        <header class="header">
          <h1>Willkommen zurück!</h1>

          <h4>melde dich an und fahre los</h4>
        </header>
        <div class="textfield">
          <v-text-field
            id="email"
            v-model="email"
            label="Deine Email"
            placeholder="Gebe deine Uni-Mail (uni-bayreuth/myubt.de) an."
            variant="solo-filled"
            rounded
            prepend-inner-icon="mdi-email-outline"
          />
          <v-text-field
            id="password"
            v-model="password"
            label="Passwort"
            variant="solo-filled"
            rounded
            prepend-inner-icon="mdi-lock-outline"
          />
        </div>
        <v-btn
          class="button"
          type="submit"
          rounded="xl"
          size="x-large"
          @click="loginUser"
        >
          Einloggen
        </v-btn>
        <div class="question">
          <p>
            Du hast noch keinen einen Account?
            <router-link
              class="link"
              :to="{name: 'Registrierung'}"
              @click="gotToRegister"
            >
              Registrieren
            </router-link>
          </p>
        </div>
      </container>
    </div>
  </v-form>
</template>


<script>
//import { supabase } from '@/Clients/supabaseClient';

import { SessionManager } from '@/Clients/sessionManager'; // Importiere Session-Handling


  export default {
    data: () => {
      return {
      email: "",
      password: "",
      errorMessage: "", // Fehlermeldungen anzeigen
      }
    },
    created() {
        this.email = this.$route.query.email || '';
        this.password = this.$route.query.password || '';
      },
    methods: {


      goToRatingCard(){
          this.$router.push({ name: 'Bewertung'})
        },

      async loginUser() {
        try {
          const { data, error } = await SessionManager.signIn(this.email, this.password);


          if(error) {
            this.errorMessage = "Login fehlgeschlagen: " + error.message;
            return;

          }
          console.log("Login erfolgreich: ", data);


          // Prüfe, ob die Session erfolgreich gesetzt wurde
        const session = await SessionManager.getCurrentSession();
        if (!session) {
          this.errorMessage = 'Sitzung konnte nicht gestartet werden.';
          return;
        }

          //Nach erfolgreichem Login weiter zur Home-Ansicht
          this.$router.push({name: 'Fahrt'});
        } catch(err) {
          this.errorMessage = "Ein unerwarteter Fehler ist aufgetreten.";
          console.error("Login-Fehler: ", err);
        }
      },
    },
  };

</script>

<style scoped>


.icon {
display: flex;
justify-content: center;
margin-bottom: -100px;

}
.container {

  display: flex;
  justify-content: center;
  margin:auto
}

.container .icon {

 display: flex;
 margin: auto;
 justify-content: center;

}

.header h1 {

  display: flex;
  padding-bottom: 20px ;
  justify-content: center;
  font-weight:500;

}

.header h4 {

  display: flex;
  justify-content: center;
  color: rgb(54, 70, 45);
  padding-bottom: 50px ;
  font-style: italic;
  font-weight: 200;
  font-weight: 300;
  font-size: larger;
}

.textfield {

  justify-content: center;
  align-items: center;
  margin: auto;
  width: 500px;

}

.button {

  display: flex;
  justify-content: center;
  align-items: center;
  margin:auto;
  margin-top: 50px;
  padding: 30px;
  background-color: rgba(47, 96, 36, 0.274);
}

.question {
  display: flex;
  justify-content: center;
  margin: auto;
  margin-top: 30px;


}

.link  {
  color:rgba(47, 96, 36, 0.613);
  text-decoration-line:none ;
  text-decoration-color: none;
  margin-left:3px ;
}
</style>
