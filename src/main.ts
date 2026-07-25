import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { CreateFeatherToast } from 'feather-toast-vue'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(CreateFeatherToast)

app.mount('#app')
