<script setup lang="ts">
import { computed } from 'vue';
import type { StoreSettings } from '../../services/api';

const props = defineProps<{ settings: StoreSettings }>();

const socialLinks = computed(() => Object.entries(props.settings.social ?? {})
  .filter(([, url]) => /^https?:\/\/\S+$/i.test(url))
  .map(([name, url]) => ({ name, url })));
const email = computed(() => props.settings.contact_email || 'support@kisakusupplyagencies.co.ke');
const phone = computed(() => props.settings.contact_phone || '+254 796 819798');
const phoneHref = computed(() => phone.value.replace(/[^\d+]/g, ''));
const whatsappUrl = computed(() => {
  const number = props.settings.whatsapp?.replace(/\D/g, '');
  return number ? `https://wa.me/${number}` : '';
});
</script>

<template>
  <footer class="store-footer">
    <div class="footer-content">
      <section class="footer-brand">
        <router-link to="/" class="footer-logo" :aria-label="`${settings.store_name} home`">
          <img src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png" :alt="settings.store_name">
        </router-link>
        <p>{{ settings.tagline || 'Everyday essentials, thoughtfully selected.' }}</p>
        <div v-if="socialLinks.length" class="social-links" aria-label="Social media">
          <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noopener noreferrer">
            {{ social.name }}
          </a>
        </div>
      </section>

      <nav class="footer-column" aria-label="Company">
        <h2>Company</h2>
        <router-link to="/about">About Kisaku</router-link>
        <router-link to="/shop">Our products</router-link>
      </nav>

      <nav class="footer-column" aria-label="Customer service">
        <h2>Customer service</h2>
        <router-link to="/contact">Contact us</router-link>
        <router-link to="/track-order">Order tracking</router-link>
        <router-link to="/profile">My account</router-link>
      </nav>

      <address class="footer-column">
        <h2>Contact</h2>
        <a :href="`mailto:${email}`">{{ email }}</a>
        <a href="mailto:vendorsupport@kisakusupplyagencies.co.ke">Vendor support</a>
        <a :href="`tel:${phoneHref}`">{{ phone }}</a>
        <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <span v-if="settings.address">{{ settings.address }}</span>
        <span v-if="settings.opening_hours">{{ settings.opening_hours }}</span>
      </address>

      <nav class="footer-column" aria-label="Legal">
        <h2>Legal</h2>
        <router-link to="/privacy-policy">Privacy Policy</router-link>
        <router-link to="/terms">Terms of Service</router-link>
      </nav>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} {{ settings.store_name }}. All rights reserved.</p>
      <p>Kenya</p>
    </div>
  </footer>
</template>

<style scoped>
.store-footer {
  padding: 34px max(20px, calc((100% - 1240px) / 2)) 16px;
  background: #102a43;
  color: #d7e3ef;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(190px, 1.35fr) repeat(4, minmax(120px, 0.8fr));
  gap: 28px;
  padding-bottom: 28px;
}

.footer-brand,
.footer-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 5px;
  background: #fff;
}

.footer-logo img {
  display: block;
  width: 174px;
  height: auto;
}

.footer-brand p {
  max-width: 240px;
  margin: 3px 0 0;
  color: #b6c4d2;
  font-size: 0.82rem;
  line-height: 1.55;
}

.footer-column h2 {
  margin: 3px 0 4px;
  color: #fff;
  font-size: 0.86rem;
  font-weight: 750;
}

.footer-column a,
.footer-column span {
  overflow-wrap: anywhere;
  color: #c3d0dd;
  font-size: 0.76rem;
  line-height: 1.5;
  text-decoration: none;
}

.footer-column a:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer-column address,
.footer-column {
  font-style: normal;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.social-links a {
  color: #c3d0dd;
  font-size: 0.72rem;
  text-decoration: none;
}

.social-links a:hover {
  color: #fff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid rgb(255 255 255 / 16%);
  color: #aab8c7;
  font-size: 0.72rem;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 1000px) {
  .footer-content {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 26px 22px;
  }
}

@media (max-width: 640px) {
  .store-footer {
    padding: 28px 20px 14px;
  }

  .footer-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 18px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    font-size: 0.66rem;
  }
}

@media (max-width: 380px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-brand {
    grid-column: auto;
  }
}
</style>
