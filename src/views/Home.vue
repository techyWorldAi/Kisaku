<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Hero from '../components/layout/Hero.vue'
import Header from '../components/layout/Menu.vue'
import Product from '../components/product/ProductList.vue'
import StorefrontFooter from '../components/storefront/StorefrontFooter.vue'
import StorefrontSections from '../components/storefront/StorefrontSections.vue'
import StorefrontTrustStrip from '../components/storefront/StorefrontTrustStrip.vue'
import { storefrontAPI } from '../services/api'
import type { StoreSettings, StorefrontBanner, StorefrontSection } from '../services/api'

const campaignBanner = ref<StorefrontBanner>()
const showCampaignBanner = ref(true)
const homepageSections = ref<StorefrontSection[]>([])
const additionalBanners = ref<StorefrontBanner[]>([])
const storeSettings = ref<StoreSettings>({ store_name: 'Kisaku Supply Agencies', social: {} })
const hasConfiguredProductRows = computed(() => homepageSections.value.some(
  (section) => section.is_visible && section.type === 'product_row',
))

onMounted(async () => {
  try {
    const storefront = await storefrontAPI.getPublished()
    storeSettings.value = storefront.settings
    homepageSections.value = storefront.sections
    additionalBanners.value = storefront.banners
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
    <Header :store-settings="storeSettings" />
    <Hero v-if="showCampaignBanner" :banner="campaignBanner" />
    <Product :show-products="!hasConfiguredProductRows" />
    <StorefrontSections :sections="homepageSections" :banners="additionalBanners" />
    <StorefrontTrustStrip />
    <StorefrontFooter :settings="storeSettings" />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
}
</style>