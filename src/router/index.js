/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

import BewertungView from '@/components/BewertungView.vue'
import HomeView from '@/components/HomeView.vue'


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
      component:()=> import("@/components/AnfragenVerwalten.vue")
    },

  

    {
      path: '/registrierung',
      name: 'Registrierung',
      component:()=> import("@/components/RegisterView.vue")
    },

    {
      path: '/login',
      name: 'Login',
      component:()=> import("@/components/LoginView.vue")
    },

    {
      path:'/bewertung',
      name:'Bewertung',
      component: BewertungView

    },

    {
        path:'/fahrt',
        name: 'Fahrt',

        component:()=> import("@/components/AddFahrtView.vue")
        
    },

     {
      path: '/profil',
      name: 'Profil',
      
      component:()=> import("@/components/FahrerProfil.vue")
     },

     {
      path: '/fahrten-suche',
      name: 'Fahrten-Suche',
      component:()=> import("@/components/FahrtenSuche.vue")
  
     },

     {
      path: '/counter',
      name:'Counter',
      component:()=> import("@/components/CounterCo2.vue")
    },
    {
      path: '/liste',
      name: 'Liste',
      component:()=> import("@/components/FahrtenListe.vue")
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
