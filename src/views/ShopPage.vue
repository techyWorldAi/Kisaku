<template>
  <div class="shop-page min-h-screen bg-gray-50">
    <Header :store-settings="storeSettings" />

    <section v-if="hasCategoryHero" class="shop-category-hero" :aria-label="`${getCategoryBannerName(selectedCategory)} category banner`">
      <img
        v-if="categoryBannerImage"
        class="shop-category-hero-image"
        :src="categoryBannerImage"
        :alt="`${getCategoryBannerName(selectedCategory)} promotion`"
      />
      <div class="shop-category-hero-copy">
        <h1>{{ categoryBanner?.title || getCategoryBannerName(selectedCategory) }}</h1>
        <p v-if="categoryBanner?.config.text || categoryListingBanner?.description">
          {{ categoryBanner?.config.text || categoryListingBanner?.description }}
        </p>
        <a
          :href="categoryBannerLink"
          :target="isExternalCategoryBannerLink ? '_blank' : undefined"
          :rel="isExternalCategoryBannerLink ? 'noopener noreferrer' : undefined"
          class="shop-hero-button"
        >
          {{ categoryBanner?.config.button_label || 'Shop this category' }} <ArrowRight :size="16" />
        </a>
      </div>
    </section>
    <router-link v-else to="/shop" class="shop-hero" aria-label="Shop everyday essentials">
      <span class="shop-hero-copy">
        <strong>Shop Smart. <em>Live Better.</em></strong>
        <span>Great deals on your favourite products</span>
        <span class="shop-hero-button">Shop now <ArrowRight :size="16" /></span>
      </span>
      <span class="shop-hero-art" aria-hidden="true"></span>
    </router-link>

    <main class="shop-main">
      <div class="shop-page-heading">
        <div>
          <nav class="shop-breadcrumbs" aria-label="Breadcrumb">
            <router-link to="/" aria-label="Home"><House :size="14" /></router-link>
            <ChevronRight :size="13" aria-hidden="true" />
            <router-link to="/shop">Shop</router-link>
            <ChevronRight :size="13" aria-hidden="true" />
            <span>{{ selectedCategory ? getCategoryName(selectedCategory) : 'All products' }}</span>
          </nav>
          <h1>{{ selectedCategory ? getCategoryName(selectedCategory) : 'Shop All Products' }}</h1>
        </div>
        <div class="shop-toolbar">
          <button
            type="button"
            class="mobile-filter-toggle"
            :aria-expanded="mobileFiltersOpen"
            aria-controls="shop-filter-panel"
            @click="mobileFiltersOpen = true"
          >
            <SlidersHorizontal :size="15" />
            Filters
          </button>
          <label for="shop-sort">Sort by:</label>
          <select id="shop-sort" v-model="sortBy" aria-label="Sort products" @change="applyFilters">
            <option value="popular">Most popular</option>
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>

      <div class="catalog-layout">
        <div
          v-if="mobileFiltersOpen"
          class="mobile-filter-backdrop"
          aria-hidden="true"
          @click="mobileFiltersOpen = false"
        />
        <aside
          id="shop-filter-panel"
          class="filter-sidebar"
          :class="{ 'is-open': mobileFiltersOpen }"
          :role="mobileFiltersOpen ? 'dialog' : undefined"
          :aria-modal="mobileFiltersOpen ? 'true' : undefined"
          aria-label="Product filters"
        >
          <section class="filter-panel">
            <header class="filter-heading">
              <h2><SlidersHorizontal :size="15" /> Filters</h2>
              <button type="button" class="clear-filters" @click="resetFilters">Clear all</button>
              <button
                type="button"
                class="mobile-filter-close"
                aria-label="Close filters"
                @click="mobileFiltersOpen = false"
              >
                <X :size="18" />
              </button>
            </header>

            <section class="filter-group" aria-labelledby="category-filter-title">
              <h3 id="category-filter-title">Category</h3>
              <label class="filter-option">
                <input type="radio" name="shop-category" :checked="!selectedCategory" @change="clearCategory" />
                <span>All categories</span>
                <small>{{ products.length }}</small>
              </label>
              <label v-for="category in categories" :key="category.id" class="filter-option">
                <input
                  v-model="selectedCategory"
                  type="radio"
                  name="shop-category"
                  :value="String(category.id)"
                  @change="applyFilters"
                />
                <span>{{ category.name }}</span>
                <small>{{ getCategoryCount(category.id) }}</small>
              </label>
            </section>

            <section class="filter-group" aria-labelledby="price-filter-title">
              <h3 id="price-filter-title">Price range (Ksh)</h3>
              <label v-for="range in priceRanges" :key="range.label" class="filter-option">
                <input
                  v-model="selectedPriceRange"
                  type="radio"
                  name="shop-price"
                  :value="range.label"
                  @change="applyFilters"
                />
                <span>{{ range.label }}</span>
              </label>
              <button
                v-if="selectedPriceRange"
                type="button"
                class="clear-price-filter"
                @click="clearPriceRange"
              >
                Clear price filter
              </button>
            </section>

            <div v-if="hasActiveFilters" class="active-filters">
              <span class="active-label">Active filters</span>
              <div class="filter-chips">
                <span v-if="selectedCategory" class="filter-chip">
                  Category: {{ getCategoryName(selectedCategory) }}
                  <button type="button" @click="clearCategory" :aria-label="`Remove category filter: ${getCategoryName(selectedCategory)}`">
                    <X :size="13" />
                  </button>
                </span>
                <span v-if="searchQuery" class="filter-chip">
                  Search: "{{ searchQuery }}"
                  <button type="button" @click="clearSearch" aria-label="Remove search filter">
                    <X :size="13" />
                  </button>
                </span>
                <span v-if="selectedPriceRange" class="filter-chip">
                  Price: {{ selectedPriceRange }}
                  <button type="button" @click="clearPriceRange" aria-label="Remove price filter">
                    <X :size="13" />
                  </button>
                </span>
              </div>
              <button type="button" @click="resetFilters" class="reset-filters">
                Clear filters
              </button>
            </div>
          </section>
        </aside>

        <section class="shop-results" aria-label="Product results">
      <p class="shop-result-count" aria-live="polite">
        Showing <strong>{{ filteredProducts.length }}</strong>
        {{ filteredProducts.length === 1 ? 'product' : 'products' }}
      </p>
      <div v-if="!loading && filteredProducts.length > 0" class="shop-product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="shop-product-card">
          <router-link :to="`/product/${product.id}`" class="shop-product-media">
            <span v-if="product.stock === 0" class="shop-stock-badge">Out of stock</span>
            <span v-else-if="discountPercentage(product) > 0" class="shop-sale-badge">
              -{{ discountPercentage(product) }}%
            </span>
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              loading="lazy"
              @error="markImageUnavailable(product.id)"
              :class="{ 'image-hidden': unavailableImages.has(product.id) }"
            />
            <span v-if="!product.image || unavailableImages.has(product.id)" class="shop-image-fallback">
              Product image unavailable
            </span>
          </router-link>
          <button
            type="button"
            class="shop-wishlist-toggle"
            :class="{ saved: wishlistStore.isSaved(product.id) }"
            :aria-label="wishlistStore.isSaved(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
            :aria-pressed="wishlistStore.isSaved(product.id)"
            @click="toggleWishlist(product)"
          >
            <Heart :size="15" :fill="wishlistStore.isSaved(product.id) ? 'currentColor' : 'none'" />
          </button>

          <div class="shop-product-info">
            <div class="shop-product-title-row">
              <router-link :to="`/product/${product.id}`" class="shop-product-title">
                {{ product.name }}
              </router-link>
            </div>
            <span v-if="getProductCategory(product)" class="shop-product-category">
              {{ getProductCategory(product) }}
            </span>
            <div class="shop-product-meta">
              <span class="shop-product-price">KSh {{ Number(product.price).toLocaleString() }}</span>
              <del v-if="discountPercentage(product) > 0" class="shop-original-price">
                KSh {{ Number(product.original_price).toLocaleString() }}
              </del>
            </div>
            <div v-if="getProductRating(product) !== null" class="shop-product-rating">
              <Star :size="12" fill="currentColor" aria-hidden="true" />
              <span>{{ getProductRating(product)?.toFixed(1) }}</span>
              <span v-if="getProductReviewCount(product) !== null" class="shop-review-count">
                ({{ getProductReviewCount(product)?.toLocaleString() }})
              </span>
            </div>
            <div class="product-action-row product-card-actions">
              <button
                type="button"
                class="product-action product-action-cart"
                :class="{ added: addedProductId === product.id }"
                :disabled="product.stock === 0"
                @click="addToCart(product)"
              >
                <ShoppingCart :size="14" aria-hidden="true" />
                {{ addedProductId === product.id ? 'Added to Cart' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          <p class="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="loadError && !loading" class="text-center py-12" role="status">
        <h3 class="mt-4 text-lg font-medium text-gray-900">Products are temporarily unavailable</h3>
        <p class="mt-2 text-gray-500">We couldn't connect to the catalogue. Please try again in a moment.</p>
        <button @click="fetchProducts" class="mt-4 inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
          Try again
        </button>
      </div>
      <div v-else-if="!loading && filteredProducts.length === 0" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <svg class="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p class="mt-2 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          <button 
            @click="resetFilters"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Reset filters
          </button>
        </div>
      </div>
        </section>
        <aside class="shop-value-banner">
          <span class="value-banner-mark"><ShoppingBag :size="27" /></span>
          <h2>Kisaku<br />Value Packs</h2>
          <p>Bundle &amp; save more!</p>
          <span class="value-banner-art" aria-hidden="true"></span>
          <router-link to="/shop">Explore bundles <ArrowRight :size="15" /></router-link>
        </aside>
      </div>

    </main>
    <StorefrontTrustStrip />
    <StorefrontFooter :settings="storeSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowRight,
  ChevronRight,
  Heart,
  House,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { useWishlistStore } from '../store/wishlist';
import { productAPI, storefrontAPI } from '../services/api';
import type { Product, Category, StoreSettings, StorefrontSection } from '../services/api';
import Header from '../components/layout/Menu.vue';
import StorefrontFooter from '../components/storefront/StorefrontFooter.vue';
import StorefrontTrustStrip from '../components/storefront/StorefrontTrustStrip.vue';

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const storeSettings = ref<StoreSettings>({ store_name: 'Kisaku Supply Agencies', social: {} });
const storefrontSections = ref<StorefrontSection[]>([]);
const loading = ref(true);
const loadError = ref(false);
const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const route = useRoute();
const router = useRouter();
const searchQuery = ref(String(route.query.search ?? ''));
const selectedCategory = ref<number | string>(String(route.query.category ?? ''));
const sortBy = ref(String(route.query.sort ?? 'popular'));
const selectedPriceRange = ref(String(route.query.price ?? ''));
const mobileFiltersOpen = ref(false);
const unavailableImages = ref(new Set<number>());
const addedProductId = ref<number | null>(null);
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;

const categoryBanner = computed(() => {
  const categoryId = Number(selectedCategory.value);
  if (!Number.isInteger(categoryId) || categoryId <= 0) return null;
  return storefrontSections.value.find((section) => (
    section.section_key === `category-${categoryId}`
    && section.type === 'promo'
    && section.is_visible
  )) ?? null;
});
const categoryListingBanner = computed(() => {
  const categoryId = Number(selectedCategory.value);
  if (!Number.isInteger(categoryId) || categoryId <= 0) return null;
  return categories.value.find((category) => category.id === categoryId && category.listing_banner_image_url) ?? null;
});
const hasCategoryHero = computed(() => Boolean(categoryBanner.value || categoryListingBanner.value));
const categoryBannerImage = computed(() => {
  const image = categoryBanner.value?.config.image_url || categoryListingBanner.value?.listing_banner_image_url;
  return typeof image === 'string'
    && (/^https?:\/\/\S+$/i.test(image) || image.startsWith('/') && !image.startsWith('//'))
    ? image
    : '';
});
const categoryBannerLink = computed(() => {
  const link = categoryBanner.value?.config.link_url;
  return typeof link === 'string'
    && (/^https?:\/\/\S+$/i.test(link) || link.startsWith('/') && !link.startsWith('//'))
    ? link
    : `/shop?category=${selectedCategory.value}`;
});
const isExternalCategoryBannerLink = computed(() => /^https?:\/\//i.test(categoryBannerLink.value));

const priceRanges = [
  { label: 'Under 1,000', min: 0, max: 999 },
  { label: '1,000 – 2,000', min: 1000, max: 1999 },
  { label: '2,000 – 5,000', min: 2000, max: 4999 },
  { label: '5,000 – 10,000', min: 5000, max: 9999 },
  { label: 'Above 10,000', min: 10000, max: Number.POSITIVE_INFINITY },
];

// Computed properties
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== ''
    || selectedCategory.value !== ''
    || selectedPriceRange.value !== '';
});

const filteredProducts = computed(() => {
  let filtered = [...products.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query) ||
      (product.category && product.category.name.toLowerCase().includes(query))
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === Number(selectedCategory.value));
  }

  if (selectedPriceRange.value) {
    const range = priceRanges.find((item) => item.label === selectedPriceRange.value);
    if (range) {
      filtered = filtered.filter((product) => Number(product.price) >= range.min && Number(product.price) <= range.max);
    }
  }
  
  // Sort products
  switch (sortBy.value) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
        || (Number(b.review_count) || 0) - (Number(a.review_count) || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => {
        const timeA = Date.parse(a.created_at ?? '');
        const timeB = Date.parse(b.created_at ?? '');
        if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeB - timeA;
        return b.id - a.id;
      });
      break;
  }
  
  return filtered;
});

// Methods
function addProduct(product: Product) {
  if (product.stock === 0) return;

  cartStore.addToCart({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: 1,
    image: product.image,
  });
}

function addToCart(product: Product) {
  if (product.stock === 0) return;
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  addProduct(product);
  addedProductId.value = product.id;
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    addedProductId.value = null;
  }, 1500);
}

function toggleWishlist(product: Product) {
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  wishlistStore.toggle(product.id);
}

function discountPercentage(product: Product) {
  const originalPrice = Number(product.original_price);
  const price = Number(product.price);
  if (!Number.isFinite(originalPrice) || originalPrice <= price || price <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

function getProductRating(product: Product) {
  const rating = Number(product.rating);
  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

function getProductReviewCount(product: Product) {
  const reviewCount = Number(product.review_count);
  return Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : null;
}

function getProductCategory(product: Product) {
  return product.category?.name
    ?? categories.value.find((category) => category.id === product.category_id)?.name;
}

function applyFilters() {
  const query = {
    search: searchQuery.value.trim() || undefined,
    category: selectedCategory.value ? String(selectedCategory.value) : undefined,
    price: selectedPriceRange.value || undefined,
    sort: sortBy.value === 'popular' ? undefined : sortBy.value,
  };
  void router.push({ path: '/shop', query });
}

function markImageUnavailable(productId: number) {
  unavailableImages.value.add(productId);
}

function getCategoryName(categoryId: number | string) {
  const category = categories.value.find(c => c.id === Number(categoryId));
  return category ? category.name : 'Unknown';
}

function getCategoryBannerName(categoryId: number | string) {
  const category = categories.value.find((item) => item.id === Number(categoryId));
  return category?.name || 'Category';
}

function getCategoryCount(categoryId: number) {
  return products.value.filter((product) => product.category_id === categoryId).length;
}

function clearCategory() {
  selectedCategory.value = '';
  applyFilters();
}

function clearPriceRange() {
  selectedPriceRange.value = '';
  applyFilters();
}

function clearSearch() {
  searchQuery.value = '';
  applyFilters();
}

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = '';
  selectedPriceRange.value = '';
  sortBy.value = 'popular';
  applyFilters();
}

async function fetchProducts() {
  loading.value = true;
  loadError.value = false;
  try {
    const data = await productAPI.getPublicProducts();
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    loadError.value = true;
    products.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await productAPI.getCategories();
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
}

async function fetchStorefrontContent() {
  try {
    const storefront = await storefrontAPI.getPublished();
    storefrontSections.value = storefront.sections;
    storeSettings.value = storefront.settings;
  } catch (error) {
    console.error('Failed to load storefront content for product listings:', error);
  }
}

onMounted(() => {
  void fetchProducts();
  void fetchCategories();
  void fetchStorefrontContent();
});

onUnmounted(() => {
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
});

watch(
  () => [route.query.search, route.query.category, route.query.price, route.query.sort],
  ([search, category, price, sort]) => {
    searchQuery.value = String(search ?? '');
    selectedCategory.value = String(category ?? '');
    selectedPriceRange.value = String(price ?? '');
    sortBy.value = String(sort ?? 'popular');
  },
);
</script>

<style scoped>
.shop-page {
  background: #f6f7f9;
  color: #102a43;
}

.shop-main {
  width: min(1240px, calc(100% - 40px));
  padding-right: 0;
  padding-left: 0;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}

.filter-sidebar {
  position: sticky;
  z-index: 3;
  top: 96px;
  align-self: start;
  max-height: calc(100vh - 112px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.filter-panel {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(16 42 67 / 4%);
}

.filter-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.filter-heading h2 {
  margin: 0;
  color: #102a43;
  font-size: 1rem;
  font-weight: 750;
}

.filter-heading .result-count {
  margin: 0;
}

.shop-results {
  min-width: 0;
}

.filter-controls,
.filter-control,
.active-filters,
.filter-chips,
.filter-chip {
  display: flex;
}

.filter-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex-wrap: wrap;
  gap: 13px;
}

.filter-control {
  flex-direction: column;
  gap: 6px;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 650;
}

.filter-control select {
  width: 100%;
  min-width: 0;
  height: 41px;
  padding: 0 32px 0 11px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  font-size: 0.84rem;
}

.result-count {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  white-space: nowrap;
}

.result-count strong {
  color: #102a43;
}

.active-filters {
  display: grid;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid #eef0f2;
}

.active-label {
  color: #64748b;
  font-size: 0.78rem;
}

.filter-chips {
  display: grid;
  gap: 7px;
}

.filter-chip {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 10px;
  border: 1px solid #dbe5ef;
  border-radius: 999px;
  background: #f0f5fa;
  color: #155da5;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.filter-chip button {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.filter-chip button:hover {
  background: rgb(21 93 165 / 10%);
}

.reset-filters {
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: #155da5;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.reset-filters:hover {
  text-decoration: underline;
}

.shop-main select,
.shop-main input {
  border-color: #cbd5e1;
}

.shop-main select:focus,
.shop-main input:focus {
  border-color: #155da5;
  --tw-ring-color: rgb(21 93 165 / 30%);
}

.shop-product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.shop-product-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 9px;
  background: #fff;
  transition: box-shadow 180ms ease, transform 180ms ease;
}

.shop-product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgb(16 42 67 / 12%);
}

.shop-product-media {
  position: relative;
  display: flex;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f7f8fa;
  text-decoration: none;
}

.shop-product-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 200ms ease;
}

.shop-wishlist-toggle {
  position: absolute;
  z-index: 2;
  top: 6px;
  right: 6px;
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: rgb(255 255 255 / 94%);
  color: #155da5;
  cursor: pointer;
}

.shop-wishlist-toggle.saved {
  color: #e11d48;
}

.shop-product-card:hover .shop-product-media img:not(.image-hidden) {
  transform: scale(1.035);
}

.shop-product-media img.image-hidden {
  display: none;
}

.shop-image-fallback {
  position: absolute;
  color: #64748b;
  font-size: 0.8rem;
}

.shop-stock-badge {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
  padding: 5px 8px;
  border-radius: 5px;
  background: #fff;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
}

.shop-product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px;
}

.shop-product-title {
  display: -webkit-box;
  min-height: 0;
  overflow: hidden;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.4;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.shop-product-title:hover {
  color: #111827;
}

.shop-product-category {
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  margin-top: 5px;
  padding: 3px 7px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.64rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-product-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin: 5px 0 0;
}

.shop-product-price {
  color: #111827;
  font-size: 0.83rem;
  font-weight: 750;
  white-space: nowrap;
}

.shop-original-price {
  color: #6b7280;
  font-size: 0.66rem;
  white-space: nowrap;
}

.shop-sale-badge {
  position: absolute;
  z-index: 1;
  top: 7px;
  left: 7px;
  padding: 3px 5px;
  border-radius: 4px;
  background: #e52429;
  color: #fff;
  font-size: 0.64rem;
  font-weight: 750;
  line-height: 1;
}

.shop-product-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 3px 0 7px;
  color: #f59e0b;
  font-size: 0.68rem;
  font-weight: 650;
}

.shop-review-count {
  color: #6b7280;
  font-weight: 400;
}

.product-card-actions {
  grid-template-columns: minmax(0, 1fr);
  margin-top: 5px;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 1024px) {
  .shop-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .shop-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .shop-main {
    width: calc(100% - 28px);
  }

  .catalog-layout {
    display: block;
  }

  .filter-sidebar {
    top: 132px;
    max-height: calc(100vh - 148px);
    margin-bottom: 14px;
  }

  .filter-panel {
    padding: 12px;
  }

  .filter-heading {
    margin-bottom: 10px;
  }

  .filter-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .shop-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .filter-control select {
    width: 100%;
    min-width: 0;
  }

  .active-filters {
    align-items: flex-start;
  }

  .shop-product-info {
    padding: 11px;
  }

  .shop-product-title {
    font-size: 0.84rem;
  }

  .shop-product-price {
    font-size: 0.95rem;
  }
}

.shop-category-hero {
  position: relative;
  display: flex;
  width: min(1280px, calc(100% - 32px));
  min-height: clamp(180px, 24vw, 320px);
  align-items: center;
  overflow: hidden;
  margin: 10px auto 0;
  border: 1px solid #dfeafa;
  border-radius: 9px;
  background: linear-gradient(105deg, #eaf3ff 0%, #f8fbff 52%, #d7e9fc 100%);
  color: #102c49;
}

.shop-category-hero::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #102c49 0%, rgb(16 44 73 / 78%) 45%, rgb(16 44 73 / 8%) 100%);
  content: "";
}

.shop-category-hero-image {
  position: absolute;
  inset: 0 0 0 30%;
  width: 70%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.shop-category-hero-copy {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(620px, 78%);
  gap: 9px;
  padding: clamp(22px, 5vw, 56px);
  color: #fff;
}

.shop-category-hero-copy h1 {
  margin: 0;
  font-size: clamp(1.4rem, 3.8vw, 2.8rem);
  line-height: 1.1;
}

.shop-category-hero-copy p {
  max-width: 52ch;
  margin: 0;
  font-size: clamp(0.85rem, 1.6vw, 1.05rem);
  line-height: 1.55;
}

.shop-category-hero-copy .shop-hero-button {
  margin-top: 5px;
}

.shop-hero {
  position: relative;
  display: flex;
  width: min(1280px, calc(100% - 32px));
  height: clamp(112px, 12vw, 142px);
  align-items: center;
  overflow: hidden;
  margin: 10px auto 0;
  border: 1px solid #dfeafa;
  border-radius: 9px;
  background: linear-gradient(105deg, #eaf3ff 0%, #f8fbff 52%, #d7e9fc 100%);
  color: #102c49;
  text-decoration: none;
}

.shop-hero::after {
  position: absolute;
  inset: 0 0 0 42%;
  background: linear-gradient(90deg, #f8fbff 0%, rgb(248 251 255 / 0%) 32%);
  content: "";
  pointer-events: none;
}

.shop-hero-art {
  position: absolute;
  top: 0;
  right: 0;
  width: 58%;
  height: 100%;
  background-image: url("/Kisaku Everyday Essentials Delivered.png");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: auto 220%;
}

.shop-hero-copy {
  z-index: 1;
  display: grid;
  width: 60%;
  gap: 3px;
  padding: 12px clamp(18px, 5.5vw, 68px);
}

.shop-hero-copy > strong {
  color: #102c49;
  font-size: clamp(1.3rem, 3.5vw, 2.55rem);
  font-style: italic;
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.05;
  white-space: nowrap;
}

.shop-hero-copy em {
  color: #f58216;
  font-style: inherit;
}

.shop-hero-copy > span:nth-child(2) {
  color: #193b62;
  font-size: clamp(0.76rem, 1.7vw, 1.05rem);
  font-weight: 700;
}

.shop-hero-button {
  display: inline-flex;
  width: fit-content;
  min-height: 30px;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  padding: 5px 15px;
  border-radius: 999px;
  background: #f58216;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 750;
}

.shop-main {
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 8px 0 10px;
}

.shop-page-heading {
  display: flex;
  min-height: 48px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.shop-page-heading h1 {
  margin: 3px 0 0;
  color: #102c49;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.shop-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #62758d;
  font-size: 0.68rem;
}

.shop-breadcrumbs a {
  display: inline-flex;
  align-items: center;
  color: #075397;
  text-decoration: none;
}

.shop-breadcrumbs a:hover {
  text-decoration: underline;
}

.shop-toolbar {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 650;
}

.shop-toolbar select {
  height: 29px;
  max-width: 130px;
  padding: 0 22px 0 8px;
  border: 1px solid #cbd8e8;
  border-radius: 5px;
  background: #fff;
  color: #17355b;
  font: inherit;
  font-size: 0.67rem;
}

.catalog-layout {
  grid-template-columns: 172px minmax(0, 1fr) 135px;
  gap: 9px;
}

.filter-sidebar {
  position: sticky;
  z-index: 3;
  top: 96px;
  align-self: start;
  max-height: calc(100vh - 112px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.filter-panel {
  padding: 10px;
  border-color: #e2e8f0;
  border-radius: 8px;
}

.filter-heading {
  align-items: center;
  margin-bottom: 9px;
}

.filter-heading h2 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.77rem;
}

.clear-filters,
.clear-price-filter {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: #075397;
  font: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  cursor: pointer;
}

.clear-filters:hover,
.clear-price-filter:hover {
  text-decoration: underline;
}

.filter-group {
  display: grid;
  gap: 5px;
  padding: 9px 0;
  border-top: 1px solid #edf1f5;
}

.filter-group h3 {
  margin: 0 0 2px;
  color: #263b56;
  font-size: 0.68rem;
  font-weight: 750;
}

.filter-option {
  display: grid;
  min-width: 0;
  grid-template-columns: 13px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 0.64rem;
  line-height: 1.2;
  cursor: pointer;
}

.filter-option input {
  width: 12px;
  height: 12px;
  margin: 0;
  accent-color: #075397;
}

.filter-option span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-option small {
  color: #94a3b8;
  font-size: 0.56rem;
}

.clear-price-filter {
  justify-self: start;
}

.filter-heading .clear-filters {
  flex: 0 0 auto;
}

.active-filters {
  margin-top: 8px;
  padding-top: 8px;
}

.active-label {
  font-size: 0.66rem;
}

.filter-chip {
  gap: 3px;
  padding: 3px 5px;
  font-size: 0.62rem;
}

.filter-chip button {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.reset-filters {
  font-size: 0.67rem;
}

.shop-results {
  min-width: 0;
}

.shop-result-count {
  margin: 0 0 5px;
  color: #61758e;
  font-size: 0.65rem;
}

.shop-result-count strong {
  color: #17355b;
}

.shop-product-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
}

.shop-product-card {
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgb(16 42 67 / 4%);
}

.shop-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 17px rgb(16 42 67 / 10%);
}

.shop-product-media {
  aspect-ratio: 1.4 / 1;
  background: #fff;
}

.shop-product-media img {
  object-fit: cover;
  padding: 0;
}

.shop-product-info {
  padding: 10px 12px 12px;
}

.shop-product-title-row {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 4px;
}

.shop-product-title {
  min-width: 0;
  flex: 1;
  color: #172b3e;
  font-size: 0.88rem;
  font-weight: 700;
}

.shop-product-category {
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  margin-top: 7px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #465568;
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-product-meta {
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
}

.shop-product-price {
  color: #101820;
  font-size: 0.96rem;
  font-weight: 750;
}

.shop-original-price {
  color: #64748b;
  font-size: 0.72rem;
}

.shop-product-rating {
  margin: 7px 0 9px;
  font-size: 0.78rem;
}

.product-card-actions {
  margin-top: auto;
}

.product-card-actions :deep(.product-action) {
  min-height: 52px;
  gap: 7px;
  padding: 10px 8px;
  border-radius: 9px;
  font-size: 0.94rem;
}

.shop-value-banner {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  padding: 16px 8px 9px;
  border-radius: 8px;
  background: linear-gradient(180deg, #075397, #063665);
  color: #fff;
  text-align: center;
}

.value-banner-mark {
  display: none;
}

.shop-value-banner h2 {
  z-index: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 850;
  line-height: 1.15;
  text-transform: uppercase;
}

.shop-value-banner p {
  z-index: 1;
  margin: 5px 0 0;
  color: #ffbf32;
  font-size: 0.72rem;
  font-style: italic;
  font-weight: 800;
}

.value-banner-art {
  display: block;
  width: 100%;
  min-height: 0;
  flex: 1;
  margin: 8px 0;
  border-radius: 4px;
  background-image: url("/Kisaku Everyday Essentials Delivered.png");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: auto 180%;
}

.shop-value-banner a {
  z-index: 1;
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 5px 4px;
  border-radius: 999px;
  background: #f58216;
  color: #fff;
  font-size: 0.61rem;
  font-weight: 750;
  text-decoration: none;
}

.shop-value-banner a:hover {
  background: #df700d;
}

.mobile-filter-toggle,
.mobile-filter-close {
  display: none;
}

@media (max-width: 1100px) {
  .catalog-layout {
    grid-template-columns: 172px minmax(0, 1fr);
  }

  .shop-value-banner {
    display: none;
  }

  .shop-product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .shop-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .catalog-layout {
    grid-template-columns: 155px minmax(0, 1fr);
  }

  .shop-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

}

@media (max-width: 620px) {
  .shop-category-hero {
    width: calc(100% - 24px);
    min-height: 180px;
  }

  .shop-category-hero-image {
    left: 18%;
    width: 82%;
  }

  .shop-category-hero::after {
    background: linear-gradient(90deg, #102c49 0%, rgb(16 44 73 / 76%) 52%, rgb(16 44 73 / 12%) 100%);
  }

  .shop-category-hero-copy {
    width: 88%;
    gap: 7px;
    padding: 18px;
  }

  .shop-category-hero-copy h1 {
    font-size: 1.35rem;
  }

  .shop-hero {
    width: calc(100% - 24px);
    height: 118px;
  }

  .shop-hero-art {
    width: 48%;
    background-size: auto 220%;
  }

  .shop-hero::after {
    left: 30%;
    background: linear-gradient(90deg, #f8fbff 0%, rgb(248 251 255 / 0%) 70%);
  }

  .shop-hero-copy {
    width: 68%;
    gap: 4px;
    padding: 9px 12px;
  }

  .shop-hero-copy > strong {
    font-size: clamp(1rem, 5vw, 1.5rem);
  }

  .shop-hero-copy > span:nth-child(2) {
    max-width: 190px;
    font-size: 0.68rem;
  }

  .shop-hero-button {
    min-height: 26px;
    margin-top: 2px;
    font-size: 0.67rem;
  }

  .shop-main {
    width: calc(100% - 24px);
  }

  .shop-page-heading {
    align-items: flex-end;
  }

  .shop-page-heading h1 {
    font-size: 1rem;
  }

  .shop-toolbar {
    gap: 4px;
    font-size: 0.61rem;
  }

  .shop-toolbar select {
    max-width: 112px;
    font-size: 0.61rem;
  }

  .catalog-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .filter-sidebar {
    top: 132px;
    max-height: calc(100vh - 148px);
    overflow-y: auto;
    margin: 0;
  }

  .filter-panel {
    padding: 8px 10px;
  }

  .filter-heading {
    margin-bottom: 4px;
  }

  .filter-group {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .filter-group h3 {
    grid-column: 1 / -1;
  }

  .shop-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .shop-product-info {
    padding: 9px;
  }

  .shop-product-title {
    font-size: 0.82rem;
  }

  .shop-product-price {
    font-size: 0.9rem;
  }

  .product-card-actions :deep(.product-action) {
    min-height: 46px;
    font-size: 0.84rem;
  }
}

@media (max-width: 760px) {
  .mobile-filter-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 34px;
    padding: 0 9px;
    border: 1px solid #d6dde5;
    border-radius: 6px;
    background: #fff;
    color: #102a43;
    font-size: 0.72rem;
    font-weight: 650;
    cursor: pointer;
  }

  .filter-sidebar {
    display: none;
    position: fixed;
    z-index: 41;
    top: 50%;
    left: 50%;
    width: min(420px, calc(100vw - 32px));
    max-height: calc(100dvh - 40px);
    margin: 0;
    overflow-y: auto;
    transform: translate(-50%, -50%);
  }

  .filter-sidebar.is-open {
    display: block;
  }

  .mobile-filter-backdrop {
    position: fixed;
    z-index: 40;
    inset: 0;
    background: rgb(16 42 67 / 48%);
  }

  .filter-panel {
    padding: 16px;
  }

  .filter-heading {
    align-items: center;
  }

  .mobile-filter-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    background: #f1f5f9;
    color: #102a43;
    cursor: pointer;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shop-product-card,
  .shop-product-media img {
    transition-duration: 0.01ms;
  }
}
</style>