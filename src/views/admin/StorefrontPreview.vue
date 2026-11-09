<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storefrontAPI } from '../../services/api';
import type { PublishedStorefront, StorefrontSection } from '../../services/api';
import Header from '../../components/layout/Menu.vue';
import Hero from '../../components/layout/Hero.vue';
import ProductList from '../../components/product/ProductList.vue';
import StorefrontFooter from '../../components/storefront/StorefrontFooter.vue';
import StorefrontSections from '../../components/storefront/StorefrontSections.vue';
import StorefrontTrustStrip from '../../components/storefront/StorefrontTrustStrip.vue';

const draft = ref<PublishedStorefront | null>(null);
const loading = ref(true);
const error = ref('');

const categorySection = computed<StorefrontSection | null>(() => (
  draft.value?.sections.find((section) => section.section_key === 'categories') ?? null
));
const hasConfiguredProductRows = computed(() => draft.value?.sections.some(
  (section) => section.is_visible && section.type === 'product_row',
) ?? false);
const heroVisible = computed(() => (
  draft.value?.sections.find((section) => section.section_key === 'hero')?.is_visible ?? true
));
const campaignBanner = computed(() => (
  draft.value?.banners
    .filter((banner) => banner.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]
));

async function loadDraft() {
  loading.value = true;
  error.value = '';
  try {
    draft.value = (await storefrontAPI.getAdminState()).draft;
  } catch (loadError) {
    console.error('Failed to load storefront draft preview:', loadError);
    error.value = 'The saved draft preview could not be loaded. Return to storefront management and try again.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadDraft();
});
</script>

<template>
  <div class="storefront-preview">
    <header class="preview-toolbar">
      <div>
        <strong>Draft preview</strong>
        <span>This is the saved draft. Shoppers will not see it until you publish.</span>
      </div>
      <router-link to="/admin/storefront" class="return-link">Back to storefront management</router-link>
    </header>

    <div v-if="loading" class="preview-message" role="status">Loading saved draft…</div>
    <div v-else-if="error" class="preview-message error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadDraft">Try again</button>
    </div>
    <template v-else-if="draft">
      <Header :store-settings="draft.settings" />
      <Hero v-if="heroVisible" :banner="campaignBanner" />
      <ProductList preview :preview-category-section="categorySection" :show-products="!hasConfiguredProductRows" />
      <StorefrontSections :sections="draft.sections" :banners="draft.banners" />
      <StorefrontTrustStrip />
      <StorefrontFooter :settings="draft.settings" />
    </template>
  </div>
</template>

<style scoped>
.storefront-preview {
  min-height: 100vh;
  background: #fff;
}

.preview-toolbar {
  position: sticky;
  z-index: 100;
  top: 0;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px clamp(16px, 4vw, 48px);
  border-bottom: 1px solid #dbe3eb;
  background: #f7fafc;
  color: #17324d;
}

.preview-toolbar > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.preview-toolbar strong {
  font-size: 0.9rem;
}

.preview-toolbar span {
  color: #64748b;
  font-size: 0.75rem;
}

.return-link {
  flex: 0 0 auto;
  color: #075397;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.preview-message {
  width: min(680px, calc(100% - 32px));
  margin: 48px auto;
  padding: 20px;
  border: 1px solid #cfe0ee;
  border-radius: 8px;
  background: #f0f7fc;
  color: #153c5b;
  text-align: center;
}

.preview-message.error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.preview-message button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 5px;
  background: #075397;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 600px) {
  .preview-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
