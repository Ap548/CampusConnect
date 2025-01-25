

<template>
  <div>
  <Suspense>
  <router-view></router-view>
  </Suspense>
      </div>


      <!--Popup-Tests-->

      <h1>Popup</h1>
    <button @click="() => TogglePopup('buttonTrigger')">Open Popup</button>  """Popup öffnen"""
    <Popup_neueFahrt v-if="popupTriggers.buttonTrigger" :TogglePopup="() => TogglePopup('buttonTrigger')">
         <h2>My Popup</h2>
    </Popup_neueFahrt>

<!--Popup-Tests Ende-->
</template>

<!--Nur für Popup-Tests benötigt-->

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