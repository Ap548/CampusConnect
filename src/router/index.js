/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

import BewertungView from '@/components/BewertungView.vue'



//import { components } from 'vuetify/dist/vuetify-labs.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [ 

    {
      path: '/alternativen',
      name: 'AlternativeFahrten',
      component: ()=>import("@/components/AlternativeFahrten.vue"),
      props: true
    },


    {
      path: '/verwaltung',
      name: 'AnfragenVerwaltung',
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
      component:()=> import("@/components/FahrtenListe.vue"),
      props:true
     },

     {
      path: '/fahrten-suche',
      name: 'Fahrten-Suche',
      component:()=> import("@/components/FahrtenSuche.vue")
  
     },

     {
      path: '/home',
      name:'Counter',
      component:()=> import("@/components/CounterCo2.vue")
    },
   

     
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
