import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// @ts-ignore
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import './style.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'foodsatety',
    themes: {
      foodsatety: {
        dark: false,
        colors: {
          primary: '#2563eb',
          secondary: '#475569',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4',
          background: '#f8fafc',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VCard: { elevation: 1 },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')