<script>
import { supabase } from '@/Clients/supabaseClient';

export default {
  data ()  {
      return {
        username: "",
        email: "",
        password: "",
        form: false,
        errorMessage: null,

        rules: {
          usernameRules:
              value => {
                if(value.length<=8) return true;

                return 'Benutzername muss 8 Zeichen enthalten.'

              },

          emailRules: // Mail muss von der Uni-Domäne kommen
            value => {
              if(/^(bt\d{6}|.+)@(uni-bayreuth\.de|myubt\.de)$/.test(value)) return true;

              return 'Email muss von der Uni-Domäne stammen.'
            },

          passwordRules: // Passwort muss min. 8 Zeichen haben, davon min. ein Sonderzeichen & eine Zahl
            value=> {
              if(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/.test(value)) return true;

              return 'Passwort muss min. 8 Zeichen haben, davon min. ein Sonderzeichen & eine Zahl.'
              },
        },
      };
    },
      methods: {

        //falls bereits ein Account besteht, weiterleiten zur Login-Page
        goToLogin(){
          this.$router.push({ name: 'Login'})
        },

      //Funktion für die Registrierung
      async registerUser() {
        if(this.form ) {
          // Supabase-Authentifizierung
          const {  error } = await supabase.auth.signUp({
            email: this.email,
            password: this.password,
            options: {
              data: {
                username: this.username
              }
            }
        });
        // Erfolg: Weiterleitung zur Login-Seite
      this.$router.push({
          name: 'Login',
          query: { email: this.email, password: this.password },
        });

      if (error) {
        console.error('Fehler bei der Registrierung:', error.message);
        alert('Registrierung fehlgeschlagen: ' + error.message);
        return;
      }
    }
  },
//User-Daten in Tabelle 'clients' speichern
  async insertUser() {
    if(this.form) {
      const {insertError} = await supabase.from('clients')
      .insert({
        username: this.username,
        email: this.email,
        password:this.password,
      });
      if(insertError){
        alert('Fehler beim Einfügen der Daten: '+ insertError)
        return;
      }
    }
  }
      }
    }

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
  margin: auto;

}



.header h1 {

  display: flex;
  margin-top: 0%;
  padding-bottom: 20px ;
  justify-content: center;
  font-weight:500;

}

/* .header h4 {

  display: flex;
  justify-content: center;
  color: rgb(54, 70, 45);
  padding-bottom: 50px ;
  font-style: italic;
  font-weight: 300;
  font-size: larger;

} */

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

<template>
    <v-form
      v-model="form"
      @submit.prevent="registerUser"
    >
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
            <h1>Registrierung</h1>
  
            <!-- <h4>registriere dich und fahre los</h4> -->
          </header>
          <div class="textfield">
            <v-text-field
              id="username"
              v-model="username"
              :rules="[rules.usernameRules]"
              type="text"
              label="Dein Benutzername"
              variant="solo-filled"
              rounded
              prepend-inner-icon="mdi-account-outline"
            />
            <v-text-field
              id="email"
              v-model="email"
              :rules="[rules.emailRules]"
              type="text"
              label="Deine Email"
              placeholder="Gebe deine Uni-Mail (uni-bayreuth/myubt.de) an."
              variant="solo-filled"
              rounded
              prepend-inner-icon="mdi-email-outline"
            />
            <v-text-field
              id="password"
              v-model="password"
              :rules="[rules.passwordRules]"
              type="text"
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
            @click="insertUser"
          >
            Registrieren
          </v-btn>
          <div class="question">
            <p>
              Hast du bereits einen Account?
              <router-link
                class="link"
                :to="{name: 'Login'}"
                @click="goToLogin"
              >
                Einloggen
              </router-link>
            </p>
          </div>
        </container>
      </div>
    </v-form>
  </template>


  
  