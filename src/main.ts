import 'vue3-json-viewer/dist/vue3-json-viewer.css'
import './assets/main.css'
// import 'highlight.js/styles/monokai.css'
import '/node_modules/primeflex/primeflex.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import JsonViewer from 'vue3-json-viewer'
import Markdown from 'vue3-markdown-it'
import 'primevue/resources/themes/aura-light-indigo/theme.css'
import 'primeicons/primeicons.css'
import VueDiff from 'vue-diff'
import 'vue-diff/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue)
app.use(JsonViewer)
app.use(Markdown)
app.use(VueDiff)

app.mount('#app')
