import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
//leaflet
import 'leaflet/dist/leaflet.css';
//Router
import router from './router'



loadFonts()

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.mount('#app')


