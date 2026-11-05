<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ChevronDown,
  Menu as MenuIcon,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-vue-next';
import { productAPI } from '../../services/api';
import type { Category, Product } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';

const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Deals', to: '/shop' },
  { label: 'New Arrivals', to: { path: '/shop', query: { sort: 'newest' } } },
  { label: 'Best Sellers', to: '/shop' },
  { label: 'Brands', to: '/shop' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/about' },
];

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const mobileMenuOpen = ref(false);
const categoriesOpen = ref(false);
const searchQuery = ref('');
const searchOpen = ref(false);
const searchLoading = ref(false);
const searchFailed = ref(false);
const searchProducts = ref<Product[]>([]);
const categories = ref<Category[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let categoriesLoaded = false;
let searchProductsLoaded = false;

const accountPath = computed(() => {
  if (authStore.canAccessAdmin) return '/admin/dashboard';
  if (authStore.isAuthenticated) return '/profile';
  return { path: '/login', query: { redirect: router.currentRoute.value.fullPath } };
});
const cartPath = computed(() => (authStore.isAuthenticated
  ? '/cart'
  : { path: '/login', query: { redirect: router.currentRoute.value.fullPath } }));
const accountLabel = computed(() => {
  if (!authStore.isAuthenticated) return 'Sign in';
  return authStore.user?.name.split(/\s+/)[0] || 'My account';
});
const suggestions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (query.length < 2) return [];
  return searchProducts.value
    .filter((product) => {
      const categoryName = product.category?.name ?? '';
      return `${product.name} ${product.description} ${categoryName}`.toLowerCase().includes(query);
    })
    .slice(0, 5);
});

function closeOverlays() {
  mobileMenuOpen.value = false;
  categoriesOpen.value = false;
  searchOpen.value = false;
  cartStore.closeCartDropdown();
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target;
  if (target instanceof Element && !target.closest('.header-search')) {
    searchOpen.value = false;
  }
  if (target instanceof Element && !target.closest('.category-control')) {
    categoriesOpen.value = false;
  }
  if (target instanceof Element && !target.closest('.site-header')) {
    mobileMenuOpen.value = false;
  }
}

async function loadSearchProducts() {
  if (searchProductsLoaded || searchLoading.value) return;
  searchLoading.value = true;
  searchFailed.value = false;

  try {
    const data = await productAPI.getPublicProducts();
    searchProducts.value = Array.isArray(data) ? data : [];
    searchProductsLoaded = true;
  } catch (error) {
    console.error('Failed to load product search suggestions:', error);
    searchFailed.value = true;
  } finally {
    searchLoading.value = false;
  }
}

function handleSearchInput() {
  searchOpen.value = true;
  if (searchTimer) clearTimeout(searchTimer);

  if (searchQuery.value.trim().length < 2) return;
  searchTimer = setTimeout(() => {
    void loadSearchProducts();
  }, 250);
}

function submitSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;
  closeOverlays();
  router.push({ path: '/shop', query: { search: query } });
}

function selectSuggestion(product: Product) {
  closeOverlays();
  router.push(`/product/${product.id}`);
}

async function toggleCategories() {
  categoriesOpen.value = !categoriesOpen.value;
  if (!categoriesOpen.value || categoriesLoaded) return;

  try {
    const data = await productAPI.getCategories();
    categories.value = Array.isArray(data) ? data : [];
    categoriesLoaded = true;
  } catch (error) {
    console.error('Failed to load navigation categories:', error);
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick));
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <header class="header-main">
      <div class="header-row">
        <router-link to="/" class="brand" aria-label="Kisaku Supply Agencies home" @click="closeOverlays">
          <span class="brand-mark">K</span>
          <span class="brand-copy">
            <strong>KISAKU</strong>
            <small>SUPPLY AGENCIES</small>
          </span>
        </router-link>

        <form class="header-search" role="search" @submit.prevent="submitSearch">
          <Search class="search-leading-icon" :size="19" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            aria-label="Search products"
            aria-controls="search-suggestions"
            placeholder="Search products"
            @focus="searchOpen = true"
            @input="handleSearchInput"
          />
          <button type="submit" class="search-submit" aria-label="Submit product search">
            <Search :size="19" />
          </button>

          <div
            v-if="searchOpen && searchQuery.trim().length > 1"
            id="search-suggestions"
            class="search-suggestions"
            role="listbox"
          >
            <p v-if="searchLoading" class="suggestion-message">Searching products…</p>
            <p v-else-if="searchFailed" class="suggestion-message">Search is temporarily unavailable.</p>
            <template v-else-if="suggestions.length">
              <button
                v-for="product in suggestions"
                :key="product.id"
                type="button"
                class="suggestion-item"
                role="option"
                @click="selectSuggestion(product)"
              >
                <span class="suggestion-name">{{ product.name }}</span>
                <span class="suggestion-price">KES {{ Number(product.price).toLocaleString() }}</span>
              </button>
              <button type="submit" class="all-results">View all results</button>
            </template>
            <p v-else-if="searchProductsLoaded" class="suggestion-message">No matching products found.</p>
          </div>
        </form>

        <div class="header-actions">
          <router-link class="header-action desktop-action" to="/orders" @click="closeOverlays">
            Track order
          </router-link>
          <router-link class="header-action desktop-action" to="/about" @click="closeOverlays">
            Help
          </router-link>
          <router-link class="header-action account-action" :to="accountPath" @click="closeOverlays">
            <UserRound :size="18" />
            <span>{{ accountLabel }}</span>
          </router-link>
          <router-link class="cart-action" :to="cartPath" @click="closeOverlays">
            <span class="cart-icon-wrap">
              <ShoppingCart :size="19" />
              <span v-if="cartStore.cartItemsCount" class="cart-count">{{ cartStore.cartItemsCount }}</span>
            </span>
            <span class="cart-label">Cart</span>
          </router-link>
          <button
            class="mobile-menu-toggle"
            type="button"
            :aria-expanded="mobileMenuOpen"
            aria-label="Toggle navigation menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <X v-if="mobileMenuOpen" :size="22" />
            <MenuIcon v-else :size="22" />
          </button>
        </div>
      </div>
  </header>

  <div class="site-header">
    <nav class="primary-nav" aria-label="Main navigation">
      <div class="nav-inner">
        <div class="category-control">
          <button
            class="category-toggle"
            type="button"
            :aria-expanded="categoriesOpen"
            @click="toggleCategories"
          >
            <MenuIcon :size="17" />
            <span>All categories</span>
            <ChevronDown :size="15" />
          </button>
          <div v-if="categoriesOpen" class="category-dropdown">
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="{ path: '/shop', query: { category: String(category.id) } }"
              @click="closeOverlays"
            >
              {{ category.name }}
            </router-link>
            <router-link to="/shop" @click="closeOverlays">Browse all products</router-link>
          </div>
        </div>

        <div class="desktop-links">
          <router-link
            v-for="item in menuItems"
            :key="item.label"
            :to="item.to"
            class="nav-link"
            @click="closeOverlays"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <div v-if="mobileMenuOpen" class="mobile-navigation">
      <router-link
        v-for="item in menuItems"
        :key="item.label"
        :to="item.to"
        @click="closeOverlays"
      >
        {{ item.label }}
      </router-link>
      <router-link to="/orders" @click="closeOverlays">Track order</router-link>
    </div>
  </div>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 10;
}

.header-main {
  position: sticky;
  z-index: 20;
  top: 0;
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.header-row {
  width: min(1240px, calc(100% - 40px));
  margin: 0 auto;
}

.header-row {
  display: grid;
  min-height: 82px;
  grid-template-columns: auto minmax(200px, 1fr) auto;
  align-items: center;
  gap: clamp(18px, 3vw, 40px);
}

.brand {
  display: inline-flex;
  min-width: max-content;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  width: 43px;
  height: 43px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #f58216;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.08em;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-copy strong {
  color: #075397;
  font-size: 1.55rem;
  font-weight: 850;
  letter-spacing: 0.015em;
}

.brand-copy small {
  margin-top: 5px;
  color: #075397;
  font-size: 0.55rem;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.header-search {
  position: relative;
  display: flex;
  height: 46px;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
}

.search-leading-icon {
  margin-left: 13px;
  color: #64748b;
}

.header-search input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 12px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #102a43;
  font: inherit;
  font-size: 0.9rem;
}

.header-search:focus-within {
  border-color: #075397;
  box-shadow: 0 0 0 3px rgb(21 93 165 / 10%);
}

.search-submit {
  display: inline-flex;
  width: 46px;
  height: 44px;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0 6px 6px 0;
  background: #f58216;
  color: #fff;
  cursor: pointer;
}

.search-submit:hover {
  background: #df700d;
}

.search-suggestions {
  position: absolute;
  z-index: 30;
  top: calc(100% + 7px);
  right: 0;
  left: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 14px 28px rgb(16 42 67 / 14%);
}

.suggestion-item,
.all-results {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 13px;
  border: 0;
  border-bottom: 1px solid #f1f3f5;
  background: #fff;
  color: #102a43;
  text-align: left;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #f6f7f9;
}

.suggestion-name {
  overflow: hidden;
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-price {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 0.78rem;
}

.all-results {
  justify-content: center;
  color: #075397;
  font-size: 0.8rem;
  font-weight: 700;
}

.suggestion-message {
  margin: 0;
  padding: 14px;
  color: #64748b;
  font-size: 0.83rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.7vw, 22px);
}

.header-action,
.cart-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.header-action:hover,
.cart-action:hover {
  color: #075397;
}

.cart-action {
  gap: 8px;
}

.cart-icon-wrap {
  position: relative;
  display: inline-flex;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -9px;
  display: inline-flex;
  min-width: 17px;
  height: 17px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 999px;
  background: #f58216;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
}

.mobile-menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #102a43;
  cursor: pointer;
}

.primary-nav {
  min-height: 44px;
  background: #075397;
  color: #fff;
}

.nav-inner {
  display: flex;
  width: min(1240px, calc(100% - 40px));
  min-height: 44px;
  align-items: center;
  gap: 19px;
  margin: 0 auto;
}

.category-control {
  position: relative;
  flex: 0 0 auto;
}

.category-toggle {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 9px;
  padding: 0 14px 0 0;
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.category-dropdown {
  position: absolute;
  z-index: 30;
  top: 100%;
  left: 0;
  display: flex;
  width: 240px;
  flex-direction: column;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  background: #fff;
  box-shadow: 0 14px 28px rgb(16 42 67 / 14%);
}

.category-dropdown a {
  padding: 10px;
  border-radius: 5px;
  color: #334155;
  font-size: 0.85rem;
  text-decoration: none;
}

.category-dropdown a:hover {
  background: #f0f5fa;
  color: #075397;
}

.desktop-links {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.nav-link {
  padding: 13px 0;
  color: rgb(255 255 255 / 94%);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.mobile-navigation {
  display: none;
}

@media (max-width: 1060px) {
  .desktop-links {
    gap: 10px;
  }

  .nav-link {
    font-size: 0.72rem;
  }

  .header-actions {
    gap: 12px;
  }

  .desktop-action {
    display: none;
  }
}

@media (max-width: 760px) {
  .header-main,
  .nav-inner {
    width: calc(100% - 28px);
  }

  .header-row {
    min-height: 68px;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
    font-size: 1.55rem;
  }

  .brand-copy strong {
    font-size: 1.32rem;
  }

  .brand-copy small {
    font-size: 0.49rem;
  }

  .header-search {
    grid-row: 2;
    grid-column: 1 / -1;
    height: 42px;
    margin-bottom: 11px;
  }

  .search-submit {
    height: 40px;
  }

  .header-actions {
    gap: 11px;
  }

  .account-action span,
  .cart-label {
    display: none;
  }

  .mobile-menu-toggle {
    display: inline-flex;
  }

  .primary-nav {
    min-height: 42px;
  }

  .nav-inner {
    min-height: 42px;
  }

  .category-toggle {
    min-height: 42px;
  }

  .desktop-links {
    display: none;
  }

  .mobile-navigation {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
    padding: 10px 14px 14px;
    border-top: 1px solid rgb(255 255 255 / 14%);
    background: #075397;
  }

  .mobile-navigation a {
    min-height: 42px;
    padding: 12px 10px;
    border-radius: 5px;
    color: #fff;
    font-size: 0.85rem;
    text-decoration: none;
  }

  .mobile-navigation a:hover {
    background: rgb(255 255 255 / 10%);
  }
}

@media (max-width: 380px) {
  .brand {
    gap: 7px;
  }

  .brand-copy strong {
    font-size: 1.18rem;
  }

  .brand-copy small {
    font-size: 0.44rem;
  }
}
</style>
