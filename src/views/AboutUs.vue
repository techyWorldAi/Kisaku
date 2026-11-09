<script setup lang="ts">
import { onMounted, ref } from 'vue';
import About from '../components/layout/About.vue';
import Header from '../components/layout/Menu.vue';
import StorefrontFooter from '../components/storefront/StorefrontFooter.vue';
import StorefrontTrustStrip from '../components/storefront/StorefrontTrustStrip.vue';
import { storefrontAPI } from '../services/api';
import type { StoreSettings } from '../services/api';

const storeSettings = ref<StoreSettings>({ store_name: 'Kisaku Supply Agencies', social: {} });

onMounted(async () => {
  try {
    const storefront = await storefrontAPI.getPublished();
    storeSettings.value = storefront.settings;
  } catch (error) {
    console.error('Failed to load published storefront settings for About page:', error);
  }
});
</script>

<template>
  <div class="about-site">
    <Header :store-settings="storeSettings" />
    <About :store-name="storeSettings.store_name" />
    <StorefrontTrustStrip />
    <StorefrontFooter :settings="storeSettings" />
  </div>
</template>

<style scoped>
.about-site {
  min-height: 100vh;
  background: #fff;
}
</style>