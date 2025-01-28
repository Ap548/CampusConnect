<template>
    <div class="popup">
        <div class="popup-inner">
            <slot />
                <div class="inhalt">
                    Du kannst eine neue Fahrt akzeptieren 
                </div>



            <button class="popup-close" @click="TogglePopup()">OK</button>
        </div>
    </div>
</template>
 
 
<!--App.vue Teil des Codes:
<template>
   <h1>Popup</h1>
    <button @click="() => TogglePopup('buttonTrigger')">Open Popup</button>  """Popup öffnen"""
    <Popup_neueFahrt v-if="popupTriggers.buttonTrigger" :TogglePopup="() => TogglePopup('buttonTrigger')">
    </Popup_neueFahrt>
 </template>

 <script>
import Popup_neueFahrt from './components/Popup_neueFahrt.vue';
import {ref} from 'vue';
 
export default {
  setup () {
    const popupTriggers = ref({
      buttonTrigger: false
    });
 
    const TogglePopup = (trigger) => {
      popupTriggers.value[trigger] = !popupTriggers.value [trigger]
    }
 
    return {
      Popup_neueFahrt,
      popupTriggers,
      TogglePopup
    }
  },
 
  components: {
    Popup_neueFahrt
  },
}
 
</script>
-->
 
 
<script>
export default {
    props: ['TogglePopup']
}
</script>
 
<style scoped>
.popup {
    border-radius: 10px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
 
    .popup-inner {
        background: #FFF;
        padding: 32px;
    }
}
.rand{
    border-color: black;
    border-radius: 10px;
    border-width: 5px;
}
.popup-close.active,
.popup-close:hover {
    background-color: lightgray;
}

.popup-close {
    color: darkgray;
    border: 5px darkgray;
    border-radius: 5px;
    background-color: lightgreen;
    display: flex;
    flex-direction: column; 
    align-items: center;
    position: relative;

}
.inhalt{
    border: 2px black;
    border-radius: 10px;
    color: black;
}
 
</style>