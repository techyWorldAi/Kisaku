<script setup lang="ts">
import { computed } from 'vue';
import type { StoreSettings } from '../../services/api';

const props = defineProps<{ settings: StoreSettings }>();

const socialLinks = computed(() => Object.entries(props.settings.social ?? {})
  .filter(([, url]) => /^https?:\/\/\S+$/i.test(url))
  .map(([name, url]) => ({ name, url })));
const whatsappUrl = computed(() => {
  const number = props.settings.whatsapp?.replace(/\D/g, '');
  return number ? `https://wa.me/${number}` : '';
});
</script>

<template>
  <footer class="store-footer">
    <div class="footer-content">
      <div>
        <h2>{{ settings.store_name }}</h2>
        <p v-if="settings.tagline" class="footer-tagline">{{ settings.tagline }}</p>
        <p v-if="settings.description">{{ settings.description }}</p>
        <p v-if="settings.footer_text" class="footer-note">{{ settings.footer_text }}</p>
      </div>
      <address>
        <strong>Contact</strong>
        <a v-if="settings.contact_email" :href="`mailto:${settings.contact_email}`">{{ settings.contact_email }}</a>
        <a v-if="settings.contact_phone" :href="`tel:${settings.contact_phone}`">{{ settings.contact_phone }}</a>
        <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <span v-if="settings.address">{{ settings.address }}</span>
        <span v-if="settings.opening_hours">{{ settings.opening_hours }}</span>
      </address>
      <nav v-if="socialLinks.length" aria-label="Store social media">
        <strong>Follow us</strong>
        <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noopener noreferrer">
          {{ social.name }}
        </a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.store-footer {
  padding: 32px max(20px, calc((100% - 1240px) / 2));
  background: #102a43;
  color: #fff;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(140px, 0.7fr));
  gap: 28px;
}

.footer-content > div,
.footer-content address,
.footer-content nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.footer-content h2,
.footer-content p {
  margin: 0;
}

.footer-content h2 {
  font-size: 1.05rem;
}

.footer-content p,
.footer-content address,
.footer-content a {
  color: #d7e3ef;
  font-size: 0.82rem;
  line-height: 1.55;
}

.footer-content address {
  font-style: normal;
}

.footer-content strong {
  color: #fff;
  font-size: 0.88rem;
}

.footer-content a {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer-tagline {
  font-weight: 650;
}

@media (max-width: 640px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}
</style>
