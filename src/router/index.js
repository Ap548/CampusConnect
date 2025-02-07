/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import FahrerProfil from '@/components/FahrerProfil.vue'
import LoginView from '@/components/LoginView.vue'
import RegisterView from '@/components/RegisterView.vue'
import BewertungView from '@/components/BewertungView.vue'
import HomeView from '@/components/HomeView.vue'
import AnfragenVerwalten from '@/components/AnfragenVerwalten.vue'
import FahrtenListe from '@/components/FahrtenListe.vue'
import AddFahrtView from '@/components/AddFahrtView.vue'


//import { components } from 'vuetify/dist/vuetify-labs.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [ 


    {
      path: '/home',
      name: 'Home',
      component: HomeView

    },

    {
      path: '/verwaltung',
      name: 'Anfragenverwaltung',
      component: AnfragenVerwalten
    },

  

    {
      path: '/registrierung',
      name: 'Registrierung',
      component: RegisterView
    },

    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },

    {
      path:'/bewertung',
      name:'Bewertung',
      component: BewertungView

    },

    {
        path:'/fahrt',
        name: 'Fahrt',
        component: AddFahrtView
    },

     {
      path: '/profil',
      name: 'Profil',
      component: FahrerProfil
     },

     {
      path: '/fahrten-suche',
      name: 'Fahrten-Suche',
      component: FahrtenListe
     }

    

     
    ],


})


// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
