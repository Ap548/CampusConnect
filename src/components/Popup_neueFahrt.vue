<template>
    <div class="popup">
        <div class="popup-inner">
            <slot />
            <button class="popup-close" @click="TogglePopup()">OK</button>
        </div>
    </div>
</template>
 
 
<!--App.vue Teil des Codes:
<template>
    <h1>Popup</h1>
    <button @click="() => TogglePopup('buttonTrigger')">Open Popup</button>  """Popup öffnen"""
    <PopupTest v-if="popupTriggers.buttonTrigger" :TogglePopup="() => TogglePopup('buttonTrigger')">
         <h2>My Popup</h2>
  </PopupTest>
</template>
 
<script>
import PopupTest from './components/PopupTest.vue';
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
      PopupTest,
      popupTriggers,
      TogglePopup
    }
  },
 
  components: {
    PopupTest
  },
 
</script>
 
 
-->
 
 
<script>
export default {
    props: ['TogglePopup']
}
</script>
 
<style scoped>
.popup {
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
 
 
</style>