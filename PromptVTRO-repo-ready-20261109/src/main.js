import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { installDemoApi, isDemoMode } from './demo-api.js'

if (isDemoMode) installDemoApi()
createApp(App).mount('#app')
