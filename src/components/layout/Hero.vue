<template>
  <section class="hero-shell" aria-label="Shop Kisaku everyday essentials">
    <a :href="banner?.link_url || '/shop'" class="hero-link" aria-label="Shop everyday essentials">
      <img
        :src="banner?.image_url || '/Kisaku Everyday Essentials Delivered.png'"
        :alt="banner?.alt_text || banner?.title || 'Kisaku Supply Agencies: everyday products, great prices, delivered to you. Shop now.'"
        fetchpriority="high"
      />
    </a>
  </section>
</template>

<script setup lang="ts">
import type { StorefrontBanner } from '../../services/api';

defineProps<{ banner?: StorefrontBanner }>();
</script>

<style scoped>
.hero-shell {
  width: min(1472px, calc(100% - 40px));
  aspect-ratio: 3.48 / 1;
  margin: 18px auto 0;
  overflow: hidden;
  border-radius: 8px;
}

.hero-link {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

@media (max-width: 680px) {
  .hero-shell {
    width: calc(100% - 28px);
    aspect-ratio: 3.48 / 1;
    margin-top: 12px;
    border-radius: 6px;
  }
}
</style>
