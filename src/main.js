import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import pinia from "./stores"

loadFonts()

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .mount('#app')
