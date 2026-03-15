import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// ─── CRITICAL ORDER ───────────────────────────────────────────────────────────
// Hydrate auth state from localStorage BEFORE installing the router.
// This guarantees that the very first beforeEach guard (fired on initial page
// load or hard refresh) already sees the correct isAuthenticated / role values
// and never redirects a logged-in user to /login on a direct URL visit.
// ─────────────────────────────────────────────────────────────────────────────
const authStore = useAuthStore()
authStore.initFromStorage()

app.use(router)
app.mount('#app')