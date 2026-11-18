import { createApp } from 'vue';
// main.ts
import './assets/tailwind.css'; // or wherever your Tailwind CSS file is

import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// Recover SPA routes redirected through public/404.html. This runs before
// router creation and auth guards, so password-reset tokens remain in the URL.
const fallbackParams = new URL(window.location.href).searchParams;
const fallbackPath = fallbackParams.get('p');
if (fallbackPath) {
  const fallbackUrl = new URL(window.location.href);
  fallbackUrl.pathname = `/${fallbackPath.replace(/^\/+/, '')}`;
  fallbackParams.delete('p');
  fallbackUrl.search = fallbackParams.toString();
  window.history.replaceState({}, '', `${fallbackUrl.pathname}${fallbackUrl.search}${fallbackUrl.hash}`);
}

const app = createApp(App);
app.use(createPinia());
app.use(router); // 👈 use the router
app.mount('#app');
