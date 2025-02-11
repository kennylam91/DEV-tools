import 'vue3-json-viewer/dist/index.css'
import './assets/main.css'
import '/node_modules/primeflex/primeflex.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import JsonViewer from 'vue3-json-viewer'

import 'primevue/resources/themes/aura-light-indigo/theme.css'

import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue)
app.use(JsonViewer)

app.mount('#app')
