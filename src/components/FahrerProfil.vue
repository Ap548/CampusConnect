   <template>
    <div class="backdrop" @click="closeFahrerprofil">
      <div class="openFahrerProfil">
        <div class="header">
          <button @click="AllgemeineEinstellungen" class="leftAllgemeineEinstellungen">...</button>
          <h1>Fahrer Profil</h1>
          <button @click="Bearbeiten" class="rightBearbeiten">Bearbeiten</button>
          <button class="Schließen" @click="ToggleFahrerProfil()">Schließen</button>
        </div>

        <!--neu scroll insgesammt-->
        <div class="scroll-container-big">
          <button class="scroll-button scroll-up" @click="scrollUp">↑</button>
        

        <div class="Profilbild">
          <img :src="Profilbildlogo" alt="Profilbild" class="FormProfilbild" /> <!-- Profilbild einfügen + speichern!!!!!!!!-->
      </div>
        <div class="biosection">
          <h2><button @click="Bio">Bio</button></h2>
          <p><textarea ref="Bio" class="bioInput" @input="adjustHeight" rows="1"></textarea></p>
        </div>
        <div class="Fahrgemeinschaften">
          <h2>Fahrgemeinschaften</h2>
          <!-- Scrollbare Leiste mit Pfeilen -->
          <div class="scroll-container">
            <!-- Pfeil links -->
            <button class="scroll-button left" @click="scrollLeft">←</button>
            <!-- Scrollbarer Inhalt -->
            <div class="scroll-content" ref="scrollContent">
              <!-- Beispiel-Inhalte -->
              <div class="item">1</div>
              <div class="item">2</div>
              <div class="item">3</div>
              <div class="item">4</div>
              <div class="item">5</div>
              <div class="item">6</div>
              <div class="item">7</div>
              <div class="item">8</div>
              <!--<div class="item">9</div>
              <div class="item">10</div>
              <div class="item">11</div>-->
            </div>
            <!-- Pfeil rechts -->
            <button class="scroll-button right" @click="scrollRight">→</button>
          </div>
        </div>
        <div class="Favoriten">
          <h2>Favoriten</h2>
        </div>
        <div class="Blockiert">
          <h2>Blockiert</h2>
        </div>

        <!--scrollbar oben/unten-->
        <button class="scroll-button scroll-down" @click="scrollDown">↓</button>
      </div>

      </div>
    </div>
    
</template>

<!--Code für die Homepage bzw. App.vue open and close Event:
<template>
  <button @click="() => ToggleFahrerProfil('buttonTrigger')">Open Profil</button>
  <FahrerProfil v-if="FahrerProfilTriggers.buttonTrigger" :ToggleFahrerProfil="() => ToggleFahrerProfil('buttonTrigger')"></FahrerProfil>
</template>

<script>
import FahrerProfil from './components/FahrerProfil.vue';
import {ref} from 'vue';

export default {
setup () {
    const FahrerProfilTriggers = ref({
      buttonTrigger: false
    });

    const ToggleFahrerProfil = (trigger) => {
      FahrerProfilTriggers.value[trigger] = !FahrerProfilTriggers.value [trigger]
    }

    return {
      FahrerProfil,
      FahrerProfilTriggers,
      ToggleFahrerProfil
    }
  },

  components: {
    FahrerProfil
  },
</script>
-->



<script>
import Profilbildlogo from '@/assets/Profilbildlogo.png';
export default 
{
  props: ['ToggleFahrerProfil'],

  data:()=>({
  name: `FahrerProfil`,
  Profilbildlogo
  }),
  methods:
  {
    closeFahrerprofil(){
      this.$emit('close'); //FahrerProfil schließen  
    },
    AllgemeineEinstellungen(){
      console.log("Allgemeine Einstellungen aufgerufen");
    },
    Bearbeiten(){
      console.log("Bearbeiten aufgerufen");
    },
    /*Schließen(){
      this.closeFahrerprofil();
      console.log("Schließen aufgerufen");
    }, */
    Bio() 
    {
      if (this.$refs.Bio) {
        console.log(this.$refs.Bio);
        this.$refs.Bio.focus(); // Setzt den Fokus auf das Eingabefeld
      } else {
        console.warn("Bio erstellen");
      }
    },
    adjustHeight(BioHeight){ // Das Textfeld der Bio soll größer bzw. kleiner werden je nachdem wie viel Text enthalten ist
      const textarea = BioHeight.target;
      textarea.style.height = `auto`; // Setzt die Höhe wieder zurück
      textarea.style.height = `${textarea.scrollHeight}px` // Passt die Höhe des Textfeldes an den Text an
    },
    scrollLeft(){
      const container = this.$refs.scrollContent;
      container.scrollBy({ left: -100, behavior: 'smooth' });
    },
    scrollRight(){
      const container = this.$refs.scrollContent;
      container.scrollBy({ left: 100, behavior: 'smooth' });  
    },
    scrollUp(){
      const container = this.$refs.scrollContent;
      container.scrollBy({ top: -100, behavior: 'smooth' });
    },
    scrollDown(){
      const container = this.$refs.scrollContent;
      container.scrollBy({ top: 100, behavior: 'smooth' });  
    }
  },
}


</script>

<style scoped>
  .openFahrerProfil {
    padding: 20px;
    margin: 100px auto;
    background: white;
    width: 600px; /*90% */
    max-width: 600px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column; 
    align-items: center;
    position: relative;
    overflow: hidden;
    overflow-y: auto;
  }
  .openFahrerProfil::-webkit-scrollbar{
    width: 8px;
  }
  .backdrop {
    top: 0;
    position: fixed;
    background: rgba(0,0,0,0.5);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
    position: relative;
    padding-top: 10px;
}
.h1 {
  flex: 1;
  text-align: center;
  margin: 0;
}
.h2 {
  text-align: center;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  margin-bottom: 10px;
}
.leftAllgemeineEinstellungen {
  position: absolute;
  left: 10px;
  top: 10px;
}
.rightBearbeiten {
  position: absolute;
  right: 10px;
  top: 10px;
}
.Schließen{
  position: absolute;
  right: 10px;
  top: 40px;
}
.Profilbild {
size: 400px;
  text-align: center;
  margin-bottom: 20px;
}
.FormProfilbild {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid lightgray;
}
.biosection {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /*200px*/
}
.bioButton {
  margin-bottom: 10px;
}
.bioInput{
  width: 300px;
  height: calc();
  border: 1px solid lightgray;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  resize: none;
  overflow: hidden;
  transition: height 0.2s ease;
  box-sizing: border-box;
}
/*Anfang Fahrgemeinschaften */
.Fahrgemeinschaften {
  text-align: center;
  margin: 20px 0;
}
.Fahrgemeinschaften h2 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  margin-bottom: 10px;
}
.scroll-container {
  display: flex;
  align-items: center;
  position: relative;
  border: 2px solid lightgray;
  overflow: hidden;
  width: calc(60% - 20px);
  max-width: 650px;
  min-width: 190px;
  margin: auto;
  border-radius: 10px;
}
.scroll-content {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 10px;
  flex: 1;
  padding: 10px 0;
}
.scroll-content::-webkit-scrollbar {
  display: none; /* Scrollbar ausblenden */
}


/* !!!!!! item ist nur zum Test da !!!!!*/


.item {
  min-width: 80px;
  min-height: 80px;
  border: 2px solid black;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
/* Pfeile */
.scroll-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
  color: black;
  flex-shrink: 0;
}
.scroll-button:disabled {
  color: gray;
  cursor: not-allowed;
}
.left {
  margin-right: 5px;
}
.right {
  margin-left: 5px;
}
/*Ende Fahrgemeinschaften */

/*Anfang Favoriten */
.Favoriten h2{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  margin-bottom: 10px;
}
/*Ende Favoriten */

/*Anfang Blockiert */
.Blockiert h2{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  margin-bottom: 10px;
}
/*Ende Blockiert*/ 

.scroll-container-big{
  position: relative;
  border: 2px solid lightgray;
  overflow: hidden;
  width: calc(100% - 20px);
  min-height: 100%;
  margin: auto;
  border-radius: 10px;
  /*position: relative;
  border: 2px solid lightgray;
  overflow-x: auto; 
  width: calc(100% - 20px);
  min-height: 100%;
  margin: auto;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;*/
}
.scroll-up{
  margin-bottom: auto;
}
.scroll-down{
  margin-top: auto;
}

</style>