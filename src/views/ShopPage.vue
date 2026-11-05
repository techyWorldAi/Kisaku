<template>
  <div class="shop-page min-h-screen bg-gray-50">
    <!-- Use the shared Menu component -->
    <Header />
    
    <main class="shop-main max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
      <div class="catalog-layout">
        <aside class="filter-sidebar">
          <section class="filter-panel" aria-label="Product filters">
            <header class="filter-heading">
              <h2>Filters</h2>
              <p class="result-count" aria-live="polite">
                <strong>{{ filteredProducts.length }}</strong>
                {{ filteredProducts.length === 1 ? 'product' : 'products' }}
              </p>
            </header>

            <div class="filter-controls">
              <label class="filter-control">
                <span>Category</span>
                <select v-model="selectedCategory" aria-label="Filter by category" @change="applyFilters">
                  <option value="">All categories</option>
                  <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                    {{ category.name }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                <span>Sort by</span>
                <select v-model="sortBy" aria-label="Sort products" @change="applyFilters">
                  <option value="newest">Newest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>

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
              </div>
              <button type="button" @click="resetFilters" class="reset-filters">
                Clear filters
              </button>
            </div>
          </section>
        </aside>

        <section class="shop-results" aria-label="Product results">
      <div v-if="!loading && filteredProducts.length > 0" class="shop-product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="shop-product-card">
          <router-link :to="`/product/${product.id}`" class="shop-product-media">
            <span v-if="product.stock === 0" class="shop-stock-badge">Out of stock</span>
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

          <div class="shop-product-info">
            <router-link :to="`/product/${product.id}`" class="shop-product-title">
              {{ product.name }}
            </router-link>
            <p class="shop-product-description">{{ product.description }}</p>
            <div class="shop-product-meta">
              <span class="shop-product-price">KES {{ Number(product.price).toLocaleString() }}</span>
              <span class="shop-stock" :class="{ 'out-of-stock': product.stock === 0 }">
                {{ product.stock > 0 ? 'Available' : 'Unavailable' }}
              </span>
            </div>
            <div class="product-action-row">
              <button
                type="button"
                class="product-action product-action-buy"
                :disabled="product.stock === 0"
                @click="buyNow(product)"
              >
                <Zap :size="15" aria-hidden="true" />
                Buy now
              </button>
              <button
                type="button"
                class="product-action product-action-cart"
                :class="{ added: addedProductId === product.id }"
                :disabled="product.stock === 0"
                @click="addToCart(product)"
              >
                <ShoppingCart :size="15" aria-hidden="true" />
                {{ addedProductId === product.id ? 'Added' : 'Add to cart' }}
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShoppingCart, X, Zap } from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { productAPI } from '../services/api';
import type { Product, Category } from '../services/api';
import Header from '../components/layout/Menu.vue';

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const loadError = ref(false);
const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();
const searchQuery = ref(String(route.query.search ?? ''));
const selectedCategory = ref<number | string>(String(route.query.category ?? ''));
const sortBy = ref(String(route.query.sort ?? 'newest'));
const unavailableImages = ref(new Set<number>());
const addedProductId = ref<number | null>(null);
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;

// Computed properties
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || selectedCategory.value !== '';
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
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
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

function buyNow(product: Product) {
  if (product.stock === 0) return;
  addProduct(product);

  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  void router.push('/checkout');
}

function applyFilters() {
  const query = {
    search: searchQuery.value.trim() || undefined,
    category: selectedCategory.value ? String(selectedCategory.value) : undefined,
    sort: sortBy.value === 'newest' ? undefined : sortBy.value,
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

function clearCategory() {
  selectedCategory.value = '';
  applyFilters();
}

function clearSearch() {
  searchQuery.value = '';
  applyFilters();
}

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = '';
  sortBy.value = 'newest';
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

onMounted(() => {
  void fetchProducts();
  void fetchCategories();
});

onUnmounted(() => {
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
});

watch(
  () => [route.query.search, route.query.category, route.query.sort],
  ([search, category, sort]) => {
    searchQuery.value = String(search ?? '');
    selectedCategory.value = String(category ?? '');
    sortBy.value = String(sort ?? 'newest');
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
  color: #334155;
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
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  transition: box-shadow 160ms ease, transform 160ms ease;
}

.shop-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgb(16 42 67 / 8%);
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
  padding: 14px;
}

.shop-product-title {
  display: -webkit-box;
  min-height: 42px;
  overflow: hidden;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.shop-product-title:hover {
  color: #155da5;
}

.shop-product-description {
  display: -webkit-box;
  min-height: 38px;
  overflow: hidden;
  margin: 7px 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.shop-product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 7px 0 14px;
}

.shop-product-price {
  color: #102a43;
  font-size: 1.1rem;
  font-weight: 800;
  white-space: nowrap;
}

.shop-stock {
  color: #16834a;
  font-size: 0.72rem;
  white-space: nowrap;
}

.shop-stock.out-of-stock {
  color: #64748b;
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
</style>