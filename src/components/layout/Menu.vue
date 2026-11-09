<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  Heart,
  House,
  Menu as MenuIcon,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-vue-next';
import { orderAPI, productAPI } from '../../services/api';
import type { Category, Order, Product } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { useOrdersStore } from '../../store/orders';
import { useWishlistStore } from '../../store/wishlist';
import { formatOrderNumber } from '../../utils/orderNumber';

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
const ordersStore = useOrdersStore();
const wishlistStore = useWishlistStore();
const mobileMenuOpen = ref(false);
const categoriesOpen = ref(false);
const searchQuery = ref('');
const searchOpen = ref(false);
const notificationPopupOpen = ref(false);
const notificationOrders = ref<Order[]>([]);
const notificationsLoading = ref(false);
const notificationsError = ref('');
const searchLoading = ref(false);
const searchFailed = ref(false);
const searchProducts = ref<Product[]>([]);
const categories = ref<Category[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let ordersRequestId = 0;
let categoriesLoaded = false;
let searchProductsLoaded = false;

const accountPath = computed(() => {
  if (authStore.isSalesAgent) return '/admin/sales';
  if (authStore.canAccessAdmin) return '/admin/dashboard';
  if (authStore.isAuthenticated) return '/profile';
  return { path: '/login', query: { redirect: router.currentRoute.value.fullPath } };
});
const wishlistPath = computed(() => (authStore.isCustomer
  ? { path: '/profile', query: { section: 'wishlist' } }
  : authStore.isAuthenticated
    ? accountPath.value
    : { path: '/login', query: { redirect: '/profile?section=wishlist' } }));
const categoriesTabPath = '/shop';
const cartPath = computed(() => (authStore.isAuthenticated
  ? '/cart'
  : { path: '/login', query: { redirect: router.currentRoute.value.fullPath } }));
const accountLabel = computed(() => {
  if (!authStore.isAuthenticated) return 'Sign in';
  return authStore.user?.name.split(/\s+/)[0] || 'My account';
});
const customerId = computed(() => (authStore.isCustomer ? authStore.user?.id : undefined));
const notificationCount = computed(() => notificationOrders.value.filter((order) => (
  order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped'
)).length);
const recentNotifications = computed(() => [...notificationOrders.value]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 5));
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
  notificationPopupOpen.value = false;
  cartStore.closeCartDropdown();
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target;
  if (target instanceof Element && !target.closest('.account-control')) {
    notificationPopupOpen.value = false;
  }
  if (target instanceof Element && !target.closest('.header-search')) {
    searchOpen.value = false;
  }
  if (target instanceof Element && !target.closest('.category-control')) {
    categoriesOpen.value = false;
  }
  const clickedWithinHeader = event.composedPath().some(
    (element) => element instanceof Element && element.matches('.site-header, .header-main'),
  );
  if (!clickedWithinHeader) {
    mobileMenuOpen.value = false;
  }
}

function toggleNotificationPopup() {
  notificationPopupOpen.value = !notificationPopupOpen.value;
  searchOpen.value = false;
  categoriesOpen.value = false;
  mobileMenuOpen.value = false;
  cartStore.closeCartDropdown();
}

function retryOrderNotifications() {
  const userId = customerId.value;
  if (userId !== undefined) void loadOrderNotifications(userId);
}

function notificationTitle(order: Order) {
  const orderNumber = formatOrderNumber(order.id, order.order_number);
  const update = {
    pending: 'was placed',
    confirmed: 'was confirmed',
    shipped: 'is on its way',
    delivered: 'was delivered',
    cancelled: 'was cancelled',
  }[order.status];
  return `Order #${orderNumber} ${update}`;
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function loadOrderNotifications(userId: number) {
  const requestId = ++ordersRequestId;
  notificationsLoading.value = true;
  notificationsError.value = '';

  try {
    const data = await orderAPI.getUserOrders();
    if (requestId !== ordersRequestId || customerId.value !== userId) return;

    const orders = Array.isArray(data) ? data : [];
    const currentOrder = ordersStore.currentOrder;
    notificationOrders.value = currentOrder?.user_id === userId
      && !orders.some((order) => order.id === currentOrder.id)
      ? [currentOrder, ...orders]
      : orders;
  } catch (error) {
    if (requestId !== ordersRequestId || customerId.value !== userId) return;
    console.error('Failed to load profile order notifications:', error);
    notificationsError.value = 'Order updates are temporarily unavailable.';
  } finally {
    if (requestId === ordersRequestId) notificationsLoading.value = false;
  }
}

watch(customerId, (userId) => {
  notificationOrders.value = [];
  notificationPopupOpen.value = false;
  notificationsError.value = '';

  if (userId === undefined) {
    ordersRequestId += 1;
    notificationsLoading.value = false;
    return;
  }

  void loadOrderNotifications(userId);
}, { immediate: true });

watch(() => ordersStore.currentOrder, (order) => {
  if (!order || !authStore.isCustomer || order.user_id !== authStore.user?.id) return;
  notificationOrders.value = [
    order,
    ...notificationOrders.value.filter((existing) => existing.id !== order.id),
  ];
}, { immediate: true });

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
        <router-link to="/" class="brand" aria-label="Kisaku Supply Agencies home" @click="closeOverlays">
          <img
            class="brand-logo"
            src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
            alt="Kisaku Supply Agencies"
          />
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
          <div
            v-if="authStore.isCustomer"
            class="account-control"
            @keydown.esc="notificationPopupOpen = false"
          >
            <button
              class="header-action account-action"
              type="button"
              :aria-expanded="notificationPopupOpen"
              aria-controls="profile-notifications"
              :aria-label="`Open notifications${notificationCount ? `, ${notificationCount} active order updates` : ''}`"
              @click.stop="toggleNotificationPopup"
            >
              <span class="account-icon-wrap">
                <UserRound class="desktop-account-icon" :size="18" />
                <Bell class="mobile-notification-icon" :size="19" />
                <span v-if="notificationCount" class="notification-badge">
                  {{ notificationCount > 99 ? '99+' : notificationCount }}
                </span>
              </span>
              <span>{{ accountLabel }}</span>
            </button>
            <section
              v-if="notificationPopupOpen"
              id="profile-notifications"
              class="notification-popover"
              aria-label="Order notifications"
            >
              <header class="notification-popover-heading">
                <strong>Notifications</strong>
                <router-link to="/profile" @click="closeOverlays">My account</router-link>
              </header>
              <p v-if="notificationsLoading" class="notification-popover-message" role="status">
                Loading your updates…
              </p>
              <div v-else-if="notificationsError" class="notification-popover-error" role="alert">
                <span>{{ notificationsError }}</span>
                <button type="button" @click.stop="retryOrderNotifications">Retry</button>
              </div>
              <div v-else-if="recentNotifications.length" class="notification-entries">
                <router-link
                  v-for="order in recentNotifications"
                  :key="order.id"
                  to="/orders"
                  class="notification-entry"
                  @click="closeOverlays"
                >
                  <span class="notification-entry-icon"><Package :size="17" aria-hidden="true" /></span>
                  <span class="notification-entry-copy">
                    <strong>{{ notificationTitle(order) }}</strong>
                    <small>KSh {{ Number(order.total).toLocaleString() }}<template v-if="formatNotificationDate(order.created_at)"> · {{ formatNotificationDate(order.created_at) }}</template></small>
                  </span>
                  <ChevronRight :size="16" aria-hidden="true" />
                </router-link>
              </div>
              <p v-else class="notification-popover-message">No order updates yet.</p>
              <footer class="notification-popover-footer">
                <router-link to="/orders" @click="closeOverlays">View all orders</router-link>
                <router-link to="/about" @click="closeOverlays">Contact support</router-link>
              </footer>
            </section>
          </div>
          <router-link
            v-else
            class="header-action account-action"
            :to="accountPath"
            @click="closeOverlays"
          >
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

  <nav class="mobile-tab-bar" aria-label="Mobile shopping navigation">
    <router-link to="/" class="mobile-tab" :class="{ active: router.currentRoute.value.path === '/' }">
      <House :size="19" aria-hidden="true" />
      <span>Home</span>
    </router-link>
    <router-link
      :to="categoriesTabPath"
      class="mobile-tab"
      :class="{ active: router.currentRoute.value.path === '/shop' }"
    >
      <Grid2X2 :size="19" aria-hidden="true" />
      <span>Categories</span>
    </router-link>
    <router-link :to="wishlistPath" class="mobile-tab">
      <span class="mobile-tab-icon">
        <Heart :size="19" aria-hidden="true" />
        <span v-if="wishlistStore.count" class="mobile-tab-badge">
          {{ wishlistStore.count > 99 ? '99+' : wishlistStore.count }}
        </span>
      </span>
      <span>Wishlist</span>
    </router-link>
    <router-link
      :to="accountPath"
      class="mobile-tab"
      :class="{ active: router.currentRoute.value.path === '/profile' }"
    >
      <UserRound :size="19" aria-hidden="true" />
      <span>Profile</span>
    </router-link>
  </nav>
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
  min-height: 90px;
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

.brand-logo {
  display: block;
  width: 240px;
  height: 72px;
  object-fit: cover;
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

.account-control {
  position: relative;
}

.account-action {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.account-icon-wrap {
  position: relative;
  display: inline-flex;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  display: inline-flex;
  min-width: 17px;
  height: 17px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #e11d48;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
}

.notification-popover {
  position: absolute;
  z-index: 40;
  top: calc(100% + 13px);
  right: 0;
  width: min(360px, calc(100vw - 28px));
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 18px 40px rgb(16 42 67 / 18%);
  color: #102a43;
}

.notification-popover-heading,
.notification-popover-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px;
}

.notification-popover-heading {
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.notification-popover-heading a,
.notification-popover-footer a {
  color: #075397;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
}

.notification-entries {
  max-height: 310px;
  overflow-y: auto;
}

.notification-entry {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 11px;
  padding: 11px 15px;
  border-bottom: 1px solid #f1f5f9;
  color: inherit;
  text-decoration: none;
}

.notification-entry:hover {
  background: #f8fafc;
}

.notification-entry-icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eff6ff;
  color: #075397;
}

.notification-entry-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 4px;
}

.notification-entry-copy strong {
  overflow: hidden;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-entry-copy small,
.notification-popover-message {
  color: #64748b;
  font-size: 0.72rem;
}

.notification-popover-message {
  margin: 0;
  padding: 18px 15px;
}

.notification-popover-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 15px;
  color: #b91c1c;
  font-size: 0.75rem;
}

.notification-popover-error button {
  padding: 5px 8px;
  border: 1px solid #fecaca;
  border-radius: 5px;
  background: #fff;
  color: #b91c1c;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.notification-popover-footer {
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

@media (max-width: 760px) {
  .notification-popover {
    position: fixed;
    top: 134px;
    right: max(12px, env(safe-area-inset-right));
    left: max(12px, env(safe-area-inset-left));
    width: auto;
    max-height: calc(100dvh - 146px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .notification-entry {
    min-height: 68px;
    padding: 12px;
  }

  .notification-entry-copy strong {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .notification-popover-footer a {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
  }
}

.mobile-notification-icon {
  display: none;
}

.mobile-tab-bar {
  display: none;
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
  .header-main {
    width: 100%;
  }

  .header-row,
  .nav-inner {
    width: calc(100% - 28px);
  }

  .header-row {
    min-height: 68px;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 8px;
  }

  .mobile-menu-toggle {
    display: inline-flex;
    grid-column: 1;
    grid-row: 1;
    width: 38px;
    height: 40px;
  }

  .brand-logo {
    width: min(170px, 100%);
    height: 50px;
    object-fit: contain;
  }

  .brand {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }

  .header-actions {
    grid-column: 3;
    grid-row: 1;
  }

  .header-search {
    grid-row: 2;
    grid-column: 1 / -1;
    height: 40px;
    margin-bottom: 10px;
  }

  .search-submit {
    height: 38px;
  }

  .header-actions {
    gap: 5px;
  }

  .account-action,
  .cart-action {
    min-width: 38px;
    min-height: 40px;
    justify-content: center;
  }

  .account-action > span:not(.account-icon-wrap),
  .cart-label {
    display: none;
  }

  .desktop-account-icon {
    display: none;
  }

  .mobile-notification-icon {
    display: block;
  }

  .primary-nav {
    display: none;
  }

  .site-header {
    position: relative;
    z-index: 31;
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

  .mobile-tab-bar {
    position: fixed;
    z-index: 50;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 7px 8px max(7px, env(safe-area-inset-bottom));
    border-top: 1px solid #e5e7eb;
    background: rgb(255 255 255 / 97%);
    box-shadow: 0 -4px 16px rgb(16 42 67 / 7%);
    backdrop-filter: blur(12px);
  }

  .mobile-tab {
    display: flex;
    min-height: 48px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #64748b;
    font-size: 0.64rem;
    font-weight: 650;
    text-decoration: none;
  }

  .mobile-tab.active {
    color: #075397;
  }

  .mobile-tab-icon {
    position: relative;
    display: inline-flex;
  }

  .mobile-tab-badge {
    position: absolute;
    top: -7px;
    right: -11px;
    display: inline-flex;
    min-width: 15px;
    height: 15px;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    border-radius: 999px;
    background: #e11d48;
    color: #fff;
    font-size: 0.56rem;
    font-weight: 800;
  }

  :global(body) {
    padding-bottom: calc(68px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 380px) {
  .brand {
    gap: 7px;
  }

  .brand-logo {
    width: min(170px, 100%);
  }
}
</style>
