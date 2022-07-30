import { createApp } from 'vue'
import App from './App.vue'

const Master = require('./master.js') as any

createApp(App).mount('#app')
