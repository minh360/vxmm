import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import io from 'socket.io-client'
const app = createApp(App)
export const socket = io.connect('http://localhost:3000')

app.use(router)
app.mount('#app')
