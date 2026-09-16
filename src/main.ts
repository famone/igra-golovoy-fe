import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import App from '@/App.vue';
import router from '@/router';
import { initTelegram } from '@/lib/telegram';

import '@/assets/css/index.css';

// Мост Telegram поднимаем до создания приложения: `initData` нужна авторизации.
initTelegram();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 2500,
  position: 'top-center',
  theme: 'light',
  hideProgressBar: true,
  clearOnUrlChange: false,
} as ToastContainerOptions);

app.mount('#app');
