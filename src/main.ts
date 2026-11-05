import { createApp } from 'vue';
// main.ts
import './assets/tailwind.css'; // or wherever your Tailwind CSS file is

import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia());
app.use(router); // 👈 use the router
app.mount('#app');
