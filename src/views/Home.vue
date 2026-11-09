<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Hero from '../components/layout/Hero.vue'
import Header from '../components/layout/Menu.vue'
import Product from '../components/product/ProductList.vue'
import { storefrontAPI } from '../services/api'
import type { StorefrontBanner } from '../services/api'

const campaignBanner = ref<StorefrontBanner>()
const showCampaignBanner = ref(true)

onMounted(async () => {
  try {
    const storefront = await storefrontAPI.getPublished()
    const heroSection = storefront.sections.find((section) => section.section_key === 'hero')
    showCampaignBanner.value = heroSection?.is_visible ?? true
    campaignBanner.value = storefront.banners
      .filter((banner) => banner.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]
  } catch (error) {
    console.error('Failed to load published storefront campaign:', error)
  }
})
</script>

<template>
  <div class="home-page">
    <Header />
    <Hero v-if="showCampaignBanner" :banner="campaignBanner" />
    <Product />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
}
</style>