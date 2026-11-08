<template>
  <div class="account-page">
    <Header />

    <main class="account-layout">
      <aside class="account-sidebar">
        <div class="account-user-card">
          <div class="account-avatar">{{ initials }}</div>
          <div class="account-user-details">
            <strong>{{ authStore.user?.name }}</strong>
            <span>{{ authStore.user?.email }}</span>
            <small><BadgeCheck :size="13" /> Account active</small>
          </div>
        </div>

        <nav class="account-navigation" aria-label="Account navigation">
          <button
            v-for="item in accountNavigation"
            :key="item.id"
            type="button"
            :class="{ active: activeSection === item.id }"
            :aria-current="activeSection === item.id ? 'page' : undefined"
            @click="activeSection = item.id"
          >
            <component :is="item.icon" :size="18" aria-hidden="true" />
            <span>{{ item.label }}</span>
            <span v-if="item.id === 'notifications' && notificationCount" class="notification-count">
              {{ notificationCount }}
            </span>
          </button>
          <router-link to="/orders">
            <Package :size="18" aria-hidden="true" />
            <span>My orders</span>
          </router-link>
          <router-link to="/about">
            <Headphones :size="18" aria-hidden="true" />
            <span>Help &amp; support</span>
          </router-link>
          <button type="button" class="account-logout" @click="handleLogout">
            <LogOut :size="18" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </nav>
      </aside>

      <section class="account-content">
        <template v-if="activeSection === 'dashboard'">
          <header class="account-heading">
            <div>
              <h1>My Account Dashboard</h1>
              <p>Manage your orders, addresses and preferences all in one place.</p>
            </div>
            <router-link class="account-help-card" to="/about">
              <Headset :size="28" aria-hidden="true" />
              <span><strong>Need help?</strong><small>Our support team is here for you.</small></span>
              <span class="help-contact">Contact us</span>
            </router-link>
          </header>

          <div class="account-stats">
            <button type="button" class="stat-card stat-blue" @click="router.push('/orders')">
              <span class="stat-icon"><ShoppingCart :size="23" /></span>
              <span class="stat-info"><strong>{{ userOrders.length }}</strong><small>Total orders</small></span>
              <span class="stat-link">View orders <ArrowRight :size="13" /></span>
            </button>
            <button type="button" class="stat-card stat-pink" @click="activeSection = 'wishlist'">
              <span class="stat-icon"><Heart :size="23" /></span>
              <span class="stat-info"><strong>{{ wishlistStore.count }}</strong><small>Wishlist items</small></span>
              <span class="stat-link">View wishlist <ArrowRight :size="13" /></span>
            </button>
            <button type="button" class="stat-card stat-green" @click="activeSection = 'addresses'">
              <span class="stat-icon"><MapPin :size="23" /></span>
              <span class="stat-info"><strong>{{ addresses.length }}</strong><small>Saved addresses</small></span>
              <span class="stat-link">Manage addresses <ArrowRight :size="13" /></span>
            </button>
            <div class="stat-card stat-orange">
              <span class="stat-icon"><CreditCard :size="23" /></span>
              <span class="stat-info"><strong>KSh {{ totalSpent.toLocaleString() }}</strong><small>Total spent</small></span>
              <router-link class="stat-link" to="/orders">View spending <ArrowRight :size="13" /></router-link>
            </div>
          </div>

          <div class="account-dashboard-grid">
            <div class="account-primary-column">
              <section class="account-panel recent-orders-panel">
                <header class="panel-heading">
                  <h2><Package :size="19" /> Recent orders</h2>
                  <router-link to="/orders">View all orders <ArrowRight :size="13" /></router-link>
                </header>
                <div v-if="ordersLoading" class="panel-message" role="status">Loading your orders…</div>
                <div v-else-if="ordersError" class="panel-error" role="alert">
                  <span>{{ ordersError }}</span>
                  <button type="button" @click="fetchUserOrders">Try again</button>
                </div>
                <div v-else-if="recentOrders.length" class="orders-table-wrap">
                  <table class="orders-table">
                    <thead>
                      <tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="order in recentOrders" :key="order.id">
                        <td data-label="Order #">KS{{ formatOrderId(order.id) }}</td>
                        <td data-label="Date">{{ formatDateTime(order.created_at) }}</td>
                        <td data-label="Status">
                          <span class="order-status" :class="`status-${order.status}`">
                            <span></span>{{ order.status }}
                          </span>
                        </td>
                        <td data-label="Total">KSh {{ order.total.toLocaleString() }}</td>
                        <td data-label="Action"><router-link to="/orders">Track order</router-link></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="panel-empty">
                  <Package :size="26" />
                  <span>You haven’t placed an order yet.</span>
                  <router-link to="/shop">Start shopping <ArrowRight :size="13" /></router-link>
                </div>
              </section>

              <router-link class="account-promo" to="/shop">
                <span><strong>Shop smarter, save more</strong><small>Discover everyday essentials and great deals.</small><b>Explore the shop <ArrowRight :size="14" /></b></span>
                <ShoppingBag :size="65" aria-hidden="true" />
              </router-link>
            </div>

            <div class="account-secondary-column">
              <section class="account-panel account-information">
                <header class="panel-heading">
                  <h2><UserRound :size="18" /> Account information</h2>
                  <button type="button" @click="activeSection = 'settings'">Account settings</button>
                </header>
                <div class="account-information-body">
                  <span class="information-avatar"><UserRound :size="22" /></span>
                  <div>
                    <strong>{{ authStore.user?.name }}</strong>
                    <span>{{ authStore.user?.email }}</span>
                    <small><BadgeCheck :size="13" /> {{ authStore.user?.role }}</small>
                  </div>
                </div>
                <div class="account-member-since">Member since <strong>{{ formatDate(authStore.user?.created_at) }}</strong></div>
              </section>

              <section class="account-panel dashboard-address-panel">
                <header class="panel-heading">
                  <h2><MapPin :size="18" /> Delivery addresses</h2>
                  <button type="button" @click="activeSection = 'addresses'">Manage addresses <ArrowRight :size="13" /></button>
                </header>
                <div v-if="defaultAddress" class="default-address">
                  <MapPin :size="16" />
                  <span><strong>{{ defaultAddress.label }}</strong><small>{{ defaultAddress.street }}, {{ defaultAddress.city }}</small></span>
                  <b>Default</b>
                </div>
                <div v-else class="address-empty">No saved addresses yet. Add one for faster checkout.</div>
              </section>

              <section class="account-panel dashboard-wishlist-panel">
                <header class="panel-heading">
                  <h2><Heart :size="18" /> My wishlist</h2>
                  <button type="button" @click="activeSection = 'wishlist'">View wishlist <ArrowRight :size="13" /></button>
                </header>
                <div v-if="wishlistProducts.length" class="wishlist-preview">
                  <router-link v-for="product in wishlistProducts.slice(0, 4)" :key="product.id" :to="`/product/${product.id}`">
                    <img v-if="product.image" :src="product.image" :alt="product.name" />
                    <ShoppingBag v-else :size="22" />
                  </router-link>
                </div>
                <p v-else class="address-empty">Save products from the shop to find them here.</p>
              </section>
            </div>
          </div>
        </template>

        <template v-else-if="activeSection === 'addresses'">
          <header class="section-page-heading">
            <div><h1>My addresses</h1><p>Save delivery addresses for a faster checkout.</p></div>
            <button type="button" class="primary-button" @click="showAddressForm = !showAddressForm">
              <Plus :size="16" /> {{ showAddressForm ? 'Cancel' : 'Add address' }}
            </button>
          </header>

          <form v-if="showAddressForm" class="account-panel address-form" @submit.prevent="saveAddress">
            <h2>{{ editingAddressId ? 'Edit address' : 'Add a delivery address' }}</h2>
            <label>Address label<input v-model="addressForm.label" required maxlength="40" placeholder="Home, Work, etc." /></label>
            <label>Recipient name<input v-model="addressForm.recipient" required autocomplete="name" /></label>
            <label>Phone number<input v-model="addressForm.phone" required type="tel" autocomplete="tel" /></label>
            <label>Street address<input v-model="addressForm.street" required autocomplete="street-address" /></label>
            <label>City or county<input v-model="addressForm.city" required autocomplete="address-level2" /></label>
            <label class="address-default-option"><input v-model="addressForm.isDefault" type="checkbox" /> Set as default address</label>
            <p v-if="addressError" class="address-error" role="alert">{{ addressError }}</p>
            <button class="primary-button" type="submit"><Check :size="16" /> Save address</button>
          </form>

          <div v-if="addresses.length" class="saved-address-grid">
            <article v-for="address in addresses" :key="address.id" class="account-panel saved-address-card">
              <header><span><MapPin :size="18" /> {{ address.label }}</span><b v-if="address.isDefault">Default</b></header>
              <strong>{{ address.recipient }}</strong>
              <p>{{ address.phone }}</p>
              <p>{{ address.street }}</p>
              <p>{{ address.city }}</p>
              <footer>
                <button type="button" @click="editAddress(address)"><Pencil :size="14" /> Edit</button>
                <button v-if="!address.isDefault" type="button" @click="setDefaultAddress(address.id)">Set as default</button>
                <button type="button" class="danger-action" @click="removeAddress(address.id)"><Trash2 :size="14" /> Remove</button>
              </footer>
            </article>
          </div>
          <div v-else-if="!showAddressForm" class="account-panel section-empty">
            <MapPin :size="30" /><h2>No saved addresses</h2><p>Add an address to make checkout quicker next time.</p>
            <button type="button" class="primary-button" @click="showAddressForm = true"><Plus :size="16" /> Add your first address</button>
          </div>
        </template>

        <template v-else-if="activeSection === 'wishlist'">
          <header class="section-page-heading">
            <div><h1>My wishlist</h1><p>{{ wishlistStore.count }} saved product{{ wishlistStore.count === 1 ? '' : 's' }}.</p></div>
            <router-link to="/shop" class="primary-button"><ShoppingBag :size="16" /> Browse products</router-link>
          </header>
          <div v-if="productsLoading" class="account-panel panel-message" role="status">Loading your saved products…</div>
          <div v-else-if="productsError" class="account-panel panel-error" role="alert">
            <span>{{ productsError }}</span><button type="button" @click="fetchProducts">Try again</button>
          </div>
          <div v-else-if="wishlistProducts.length" class="wishlist-product-grid">
            <article v-for="product in wishlistProducts" :key="product.id" class="wishlist-product-card">
              <router-link :to="`/product/${product.id}`" class="wishlist-product-image">
                <img v-if="product.image" :src="product.image" :alt="product.name" />
                <ShoppingBag v-else :size="30" />
              </router-link>
              <div><router-link :to="`/product/${product.id}`">{{ product.name }}</router-link><strong>KSh {{ Number(product.price).toLocaleString() }}</strong></div>
              <button type="button" :aria-label="`Remove ${product.name} from wishlist`" @click="wishlistStore.toggle(product.id)">
                <Heart :size="18" fill="currentColor" />
              </button>
            </article>
          </div>
          <div v-else class="account-panel section-empty">
            <Heart :size="30" /><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here for later.</p>
            <router-link to="/shop" class="primary-button"><ShoppingBag :size="16" /> Find something you love</router-link>
          </div>
        </template>

        <template v-else-if="activeSection === 'settings'">
          <header class="section-page-heading"><div><h1>Account settings</h1><p>Your account details and sign-in information.</p></div></header>
          <section class="account-panel settings-panel">
            <h2>Personal information</h2>
            <dl><div><dt>Full name</dt><dd>{{ authStore.user?.name }}</dd></div><div><dt>Email address</dt><dd>{{ authStore.user?.email }}</dd></div><div><dt>Account type</dt><dd class="capitalize">{{ authStore.user?.role }}</dd></div><div><dt>Member since</dt><dd>{{ formatDate(authStore.user?.created_at) }}</dd></div></dl>
            <p class="settings-note">To update your account information or password, please <router-link to="/about">contact our support team</router-link>.</p>
          </section>
        </template>

        <template v-else>
          <header class="section-page-heading"><div><h1>Notifications</h1><p>Updates about your orders and account.</p></div></header>
          <div v-if="ordersLoading" class="account-panel panel-message" role="status">Loading updates…</div>
          <div v-else-if="ordersError" class="account-panel panel-error" role="alert"><span>{{ ordersError }}</span><button type="button" @click="fetchUserOrders">Try again</button></div>
          <div v-else-if="userOrders.length" class="notification-list">
            <article v-for="order in sortedOrders" :key="order.id" class="account-panel notification-item">
              <span class="notification-icon"><Package :size="19" /></span>
              <div><strong>Order #{{ order.id }} — {{ order.status }}</strong><p>Order total: KSh {{ order.total.toLocaleString() }} · {{ formatDate(order.created_at) }}</p></div>
              <router-link to="/orders">View order</router-link>
            </article>
          </div>
          <div v-else class="account-panel section-empty"><Bell :size="30" /><h2>You’re all caught up</h2><p>Order updates will appear here.</p></div>
        </template>
      </section>
    </main>

    <section class="account-benefits" aria-label="Shopping benefits">
      <div><Truck :size="21" /><span><strong>Nationwide delivery</strong><small>Across Kenya</small></span></div>
      <div><ShieldCheck :size="21" /><span><strong>Quality assured</strong><small>Trusted products</small></span></div>
      <div><CreditCard :size="21" /><span><strong>Secure payments</strong><small>M-Pesa, cards &amp; more</small></span></div>
      <div><RefreshCw :size="21" /><span><strong>Easy returns</strong><small>Hassle-free</small></span></div>
      <div><Headphones :size="21" /><span><strong>Customer support</strong><small>Here to help</small></span></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  CreditCard,
  Headphones,
  Headset,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Trash2,
  Truck,
  LayoutDashboard,
  Settings,
} from 'lucide-vue-next';
import Header from '../components/layout/Menu.vue';
import { orderAPI, productAPI } from '../services/api';
import type { Order, Product } from '../services/api';
import { useAuthStore } from '../store/auth';
import { useWishlistStore } from '../store/wishlist';

type AccountSection = 'dashboard' | 'addresses' | 'wishlist' | 'settings' | 'notifications';

interface SavedAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  isDefault: boolean;
}

const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const router = useRouter();
const activeSection = ref<AccountSection>('dashboard');
const userOrders = ref<Order[]>([]);
const products = ref<Product[]>([]);
const addresses = ref<SavedAddress[]>([]);
const ordersLoading = ref(true);
const productsLoading = ref(true);
const ordersError = ref('');
const productsError = ref('');
const showAddressForm = ref(false);
const editingAddressId = ref<string | null>(null);
const addressError = ref('');
const addressForm = reactive({
  label: '',
  recipient: '',
  phone: '',
  street: '',
  city: '',
  isDefault: false,
});

const accountNavigation = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'addresses' as const, label: 'My addresses', icon: MapPin },
  { id: 'wishlist' as const, label: 'My wishlist', icon: Heart },
  { id: 'settings' as const, label: 'Account settings', icon: Settings },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
];

const sortedOrders = computed(() => [...userOrders.value].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
));
const recentOrders = computed(() => sortedOrders.value.slice(0, 3));
const totalSpent = computed(() => userOrders.value.reduce((sum, order) => sum + Number(order.total || 0), 0));
const notificationCount = computed(() => userOrders.value.filter((order) => (
  order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped'
)).length);
const wishlistProducts = computed(() => products.value.filter((product) => wishlistStore.productIds.includes(product.id)));
const defaultAddress = computed(() => addresses.value.find((address) => address.isDefault) ?? addresses.value[0]);
const initials = computed(() => (authStore.user?.name ?? '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join(''));
const addressStorageKey = computed(() => `kisakuAddresses-${authStore.user?.id ?? 'unknown'}`);

async function fetchUserOrders() {
  ordersLoading.value = true;
  ordersError.value = '';
  try {
    const data = await orderAPI.getUserOrders();
    userOrders.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch account orders:', error);
    ordersError.value = 'We could not load your orders. Please try again.';
  } finally {
    ordersLoading.value = false;
  }
}

async function fetchProducts() {
  productsLoading.value = true;
  productsError.value = '';
  try {
    const data = await productAPI.getPublicProducts();
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load wishlist products:', error);
    productsError.value = 'We could not load your saved products. Please try again.';
  } finally {
    productsLoading.value = false;
  }
}

function loadAddresses() {
  const saved = localStorage.getItem(addressStorageKey.value);
  if (!saved) {
    addresses.value = [];
    return;
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Saved addresses must be a list.');
    addresses.value = parsed as SavedAddress[];
  } catch (error) {
    console.error('Could not read saved account addresses:', error);
    addressError.value = 'Saved addresses could not be read. Add a new address to continue.';
    addresses.value = [];
  }
}

function persistAddresses(nextAddresses: SavedAddress[]) {
  try {
    localStorage.setItem(addressStorageKey.value, JSON.stringify(nextAddresses));
    addresses.value = nextAddresses;
    addressError.value = '';
  } catch (error) {
    console.error('Could not save account addresses:', error);
    addressError.value = 'Your address could not be saved. Check your browser storage and try again.';
  }
}

function resetAddressForm() {
  Object.assign(addressForm, {
    label: '',
    recipient: authStore.user?.name ?? '',
    phone: '',
    street: '',
    city: '',
    isDefault: addresses.value.length === 0,
  });
  editingAddressId.value = null;
  addressError.value = '';
}

function saveAddress() {
  const address: SavedAddress = {
    id: editingAddressId.value ?? `${Date.now()}`,
    label: addressForm.label.trim(),
    recipient: addressForm.recipient.trim(),
    phone: addressForm.phone.trim(),
    street: addressForm.street.trim(),
    city: addressForm.city.trim(),
    isDefault: addressForm.isDefault || addresses.value.length === 0,
  };
  if (Object.values(address).some((value) => typeof value === 'string' && !value)) {
    addressError.value = 'Please complete every address field.';
    return;
  }

  const nextAddresses = addresses.value
    .filter((item) => item.id !== address.id)
    .map((item) => ({ ...item, isDefault: address.isDefault ? false : item.isDefault }));
  nextAddresses.push(address);
  persistAddresses(nextAddresses);
  if (!addressError.value) {
    showAddressForm.value = false;
    resetAddressForm();
  }
}

function editAddress(address: SavedAddress) {
  editingAddressId.value = address.id;
  Object.assign(addressForm, address);
  showAddressForm.value = true;
  addressError.value = '';
}

function setDefaultAddress(addressId: string) {
  persistAddresses(addresses.value.map((address) => ({ ...address, isDefault: address.id === addressId })));
}

function removeAddress(addressId: string) {
  const remaining = addresses.value.filter((address) => address.id !== addressId);
  const hasDefault = remaining.some((address) => address.isDefault);
  persistAddresses(remaining.map((address, index) => ({
    ...address,
    isDefault: address.isDefault || (!hasDefault && index === 0),
  })));
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatOrderId(id: string | number) {
  return String(id).replace(/\D/g, '').slice(-8).padStart(8, '0');
}

function handleLogout() {
  authStore.logout();
  void router.push('/login');
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    void router.push('/login');
    return;
  }
  if (authStore.canAccessAdmin) {
    void router.push('/admin/dashboard');
    return;
  }

  resetAddressForm();
  loadAddresses();
  void fetchUserOrders();
  void fetchProducts();
});
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background: #f7f9fc;
  color: #102a43;
}

.account-layout {
  display: grid;
  width: min(1280px, calc(100% - 40px));
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: 20px;
  margin: 0 auto;
  padding: 18px 0 8px;
}

.account-sidebar,
.account-panel,
.stat-card {
  border: 1px solid #e1e8f0;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(16 42 67 / 4%);
}

.account-sidebar {
  position: sticky;
  top: 96px;
  overflow: hidden;
  padding: 10px;
}

.account-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 1px 14px;
  border-bottom: 1px solid #edf1f5;
}

.account-avatar {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  place-items: center;
  border-radius: 50%;
  background: #075ce5;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 800;
}

.account-user-details,
.account-user-details small {
  display: grid;
}

.account-user-details {
  min-width: 0;
  gap: 3px;
}

.account-user-details strong {
  overflow: hidden;
  color: #102c49;
  font-size: 0.77rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-user-details > span {
  overflow: hidden;
  color: #64748b;
  font-size: 0.68rem;
  text-overflow: ellipsis;
}

.account-user-details small {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 3px;
  padding: 2px 5px;
  border-radius: 999px;
  background: #e8f8e9;
  color: #15803d;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: capitalize;
}

.account-navigation {
  display: grid;
  gap: 3px;
  padding-top: 10px;
}

.account-navigation button,
.account-navigation a {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #18395e;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 650;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.account-navigation button:hover,
.account-navigation a:hover {
  background: #f1f6ff;
}

.account-navigation button.active {
  border-left: 3px solid #075ce5;
  border-radius: 0 5px 5px 0;
  background: #eaf2ff;
  color: #075ce5;
}

.account-navigation button span:nth-child(2),
.account-navigation a span {
  flex: 1;
}

.notification-count {
  display: grid;
  min-width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: #ef233c;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
}

.account-navigation .account-logout {
  margin-top: 8px;
  background: #f1f4f8;
}

.account-navigation .account-logout:hover {
  background: #fff0f0;
  color: #b42318;
}

.account-content {
  min-width: 0;
}

.account-heading,
.section-page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.account-heading h1,
.section-page-heading h1 {
  margin: 0;
  color: #102c49;
  font-size: clamp(1.35rem, 2.4vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.035em;
}

.account-heading p,
.section-page-heading p {
  margin: 4px 0 0;
  color: #536981;
  font-size: 0.83rem;
}

.account-help-card {
  display: flex;
  min-width: 285px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #d5e5fb;
  border-radius: 8px;
  background: #eaf3ff;
  color: #075397;
  text-decoration: none;
}

.account-help-card > span:nth-child(2) {
  display: grid;
  flex: 1;
  gap: 2px;
}

.account-help-card strong {
  font-size: 0.74rem;
}

.account-help-card small {
  color: #415c7b;
  font-size: 0.62rem;
}

.help-contact {
  padding: 6px 8px;
  border-radius: 5px;
  background: #075397;
  color: #fff;
  font-size: 0.61rem;
  font-weight: 700;
}

.account-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.stat-card {
  display: grid;
  min-width: 0;
  min-height: 78px;
  grid-template-columns: 49px minmax(0, 1fr);
  align-items: center;
  column-gap: 9px;
  padding: 9px 10px;
  color: inherit;
  text-align: left;
}

button.stat-card {
  font: inherit;
  cursor: pointer;
}

button.stat-card:hover {
  border-color: #9abce5;
}

.stat-icon {
  display: grid;
  width: 46px;
  height: 46px;
  grid-row: span 2;
  place-items: center;
  border-radius: 50%;
}

.stat-info {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.stat-info strong {
  overflow: hidden;
  color: #102c49;
  font-size: clamp(0.9rem, 1.5vw, 1.16rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-info small {
  color: #64748b;
  font-size: 0.67rem;
}

.stat-link {
  display: inline-flex;
  grid-column: 2;
  align-items: center;
  gap: 4px;
  justify-self: end;
  color: #075ce5;
  font-size: 0.62rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.stat-blue .stat-icon { background: #e5efff; color: #1263df; }
.stat-pink .stat-icon { background: #ffe4eb; color: #eb315c; }
.stat-green .stat-icon { background: #e5f7e7; color: #14833b; }
.stat-orange .stat-icon { background: #fff1d6; color: #e99200; }

.account-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.95fr);
  align-items: start;
  gap: 13px;
}

.account-primary-column,
.account-secondary-column {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.account-panel {
  min-width: 0;
  padding: 11px;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.panel-heading h2 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: #16385f;
  font-size: 0.88rem;
  font-weight: 800;
}

.panel-heading a,
.panel-heading button {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 0;
  border: 0;
  background: none;
  color: #075ce5;
  font: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.orders-table-wrap {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  white-space: nowrap;
}

.orders-table th {
  padding: 6px;
  background: #f1f4f8;
  color: #203b5e;
  font-size: 0.61rem;
  font-weight: 750;
  text-align: left;
}

.orders-table td {
  padding: 7px 6px;
  border-bottom: 1px solid #edf1f5;
  color: #263b56;
}

.orders-table tbody tr:last-child td {
  border-bottom: 0;
}

.orders-table td:first-child {
  color: #173c68;
  font-weight: 750;
}

.orders-table td a {
  padding: 4px 6px;
  border: 1px solid #cbdcf1;
  border-radius: 5px;
  color: #075ce5;
  font-weight: 700;
  text-decoration: none;
}

.order-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: capitalize;
}

.order-status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-pending { background: #fff5d6; color: #9a6700; }
.status-confirmed { background: #e5efff; color: #1263df; }
.status-shipped { background: #e9eaff; color: #5457cf; }
.status-delivered { background: #e5f7e7; color: #14833b; }
.status-cancelled { background: #ffe8e8; color: #b42318; }

.panel-message,
.panel-empty,
.panel-error {
  display: flex;
  min-height: 95px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.78rem;
}

.panel-empty {
  flex-wrap: wrap;
  padding: 12px;
}

.panel-empty a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #075ce5;
  font-size: 0.7rem;
  font-weight: 700;
  text-decoration: none;
}

.panel-error {
  flex-wrap: wrap;
  color: #b42318;
}

.panel-error button {
  border: 0;
  background: none;
  color: #075397;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

.account-information-body {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 0;
}

.information-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 50%;
  background: #e9eef5;
  color: #8797aa;
}

.account-information-body > div {
  display: grid;
  gap: 2px;
}

.account-information-body strong {
  color: #203b5e;
  font-size: 0.68rem;
}

.account-information-body span:not(.information-avatar) {
  color: #64748b;
  font-size: 0.64rem;
}

.account-information-body small {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #15803d;
  font-size: 0.6rem;
  text-transform: capitalize;
}

.account-member-since {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid #edf1f5;
  color: #64748b;
  font-size: 0.62rem;
}

.account-member-since strong {
  color: #263b56;
}

.default-address {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #18395e;
}

.default-address > span {
  display: grid;
  flex: 1;
  gap: 3px;
}

.default-address strong {
  font-size: 0.65rem;
}

.default-address small {
  color: #536981;
  font-size: 0.62rem;
  line-height: 1.4;
}

.default-address b,
.saved-address-card header b {
  padding: 3px 6px;
  border-radius: 999px;
  background: #e5f7e7;
  color: #14833b;
  font-size: 0.55rem;
}

.address-empty {
  margin: 0;
  color: #64748b;
  font-size: 0.66rem;
  line-height: 1.5;
}

.wishlist-preview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.wishlist-preview a {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border-radius: 5px;
  background: #f4f6f9;
  color: #64748b;
}

.wishlist-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 3px;
}

.account-promo {
  display: flex;
  min-height: 104px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow: hidden;
  padding: 14px 16px;
  border-radius: 8px;
  background: linear-gradient(110deg, #ffe0c0, #fff0dd 65%, #ffd199);
  color: #17355b;
  text-decoration: none;
}

.account-promo > span {
  display: grid;
  gap: 4px;
}

.account-promo strong {
  font-size: 1.05rem;
}

.account-promo small {
  font-size: 0.7rem;
}

.account-promo b {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  padding: 6px 9px;
  border-radius: 5px;
  background: #f58216;
  color: #fff;
  font-size: 0.65rem;
}

.account-promo > svg {
  flex: 0 0 auto;
  color: #f58216;
}

.section-page-heading {
  margin-bottom: 14px;
}

.primary-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  background: #075397;
  color: #fff;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-button:hover {
  background: #063e73;
}

.address-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.address-form h2 {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.95rem;
}

.address-form > label:not(.address-default-option) {
  display: grid;
  gap: 5px;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
}

.address-form input:not([type="checkbox"]) {
  width: 100%;
  min-height: 36px;
  padding: 7px 9px;
  border: 1px solid #cbd8e8;
  border-radius: 5px;
  background: #fff;
  color: #102a43;
  font: inherit;
  font-weight: 400;
}

.address-default-option {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 0.7rem;
}

.address-form .primary-button {
  justify-self: end;
}

.address-error {
  grid-column: 1 / -1;
  margin: 0;
  color: #b42318;
  font-size: 0.72rem;
}

.saved-address-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 12px;
}

.saved-address-card {
  display: grid;
  gap: 5px;
  color: #536981;
  font-size: 0.74rem;
}

.saved-address-card header,
.saved-address-card header > span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.saved-address-card header {
  justify-content: space-between;
  margin-bottom: 5px;
  color: #173c68;
  font-weight: 750;
}

.saved-address-card > strong {
  color: #263b56;
}

.saved-address-card p {
  margin: 0;
}

.saved-address-card footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px solid #edf1f5;
}

.saved-address-card footer button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 2px;
  border: 0;
  background: none;
  color: #075397;
  font: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
}

.saved-address-card footer .danger-action {
  color: #b42318;
}

.section-empty {
  min-height: 220px;
  flex-direction: column;
  color: #718198;
  text-align: center;
}

.section-empty h2 {
  margin: 2px 0 0;
  color: #17355b;
  font-size: 1rem;
}

.section-empty p {
  margin: 0 0 6px;
  font-size: 0.75rem;
}

.wishlist-product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.wishlist-product-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e1e8f0;
  border-radius: 8px;
  background: #fff;
}

.wishlist-product-image {
  display: grid;
  aspect-ratio: 1.2;
  place-items: center;
  background: #f4f6f9;
  color: #718198;
}

.wishlist-product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.wishlist-product-card > div {
  display: grid;
  gap: 5px;
  padding: 9px;
}

.wishlist-product-card > div a {
  overflow: hidden;
  color: #17355b;
  font-size: 0.73rem;
  font-weight: 700;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wishlist-product-card > div strong {
  color: #d82c2c;
  font-size: 0.76rem;
}

.wishlist-product-card > button {
  position: absolute;
  top: 7px;
  right: 7px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid #f4dce2;
  border-radius: 50%;
  background: #fff;
  color: #e11d48;
  cursor: pointer;
}

.settings-panel h2 {
  margin: 0 0 10px;
  color: #17355b;
  font-size: 0.95rem;
}

.settings-panel dl {
  display: grid;
  max-width: 620px;
  margin: 0;
}

.settings-panel dl > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid #edf1f5;
  font-size: 0.76rem;
}

.settings-panel dt {
  color: #64748b;
}

.settings-panel dd {
  margin: 0;
  color: #17355b;
  font-weight: 700;
  text-align: right;
}

.settings-note {
  margin: 13px 0 0;
  color: #64748b;
  font-size: 0.74rem;
}

.settings-note a {
  color: #075397;
  font-weight: 700;
}

.notification-list {
  display: grid;
  gap: 9px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 50%;
  background: #eaf3ff;
  color: #075397;
}

.notification-item > div {
  min-width: 0;
  flex: 1;
}

.notification-item strong {
  color: #17355b;
  font-size: 0.76rem;
  text-transform: capitalize;
}

.notification-item p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 0.68rem;
}

.notification-item > a {
  color: #075ce5;
  font-size: 0.68rem;
  font-weight: 700;
  text-decoration: none;
}

.account-benefits {
  display: grid;
  width: min(1280px, calc(100% - 32px));
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 2px auto 10px;
  padding: 9px 8px;
  border-radius: 7px;
  background: #e8f1ff;
}

.account-benefits > div {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #075397;
}

.account-benefits > div + div {
  border-left: 1px solid #abc7eb;
}

.account-benefits span {
  display: grid;
  gap: 1px;
}

.account-benefits strong {
  color: #123b69;
  font-size: 0.63rem;
}

.account-benefits small {
  color: #415c7b;
  font-size: 0.58rem;
}

@media (max-width: 1050px) {
  .account-layout {
    grid-template-columns: 195px minmax(0, 1fr);
    gap: 13px;
  }

  .account-dashboard-grid {
    grid-template-columns: minmax(0, 1.4fr) minmax(230px, 0.9fr);
  }

  .account-help-card {
    min-width: 235px;
  }

  .help-contact {
    display: none;
  }
}

@media (max-width: 780px) {
  .account-layout {
    width: calc(100% - 28px);
    grid-template-columns: minmax(0, 1fr);
  }

  .account-sidebar {
    position: static;
    padding: 8px;
  }

  .account-user-card {
    padding-bottom: 8px;
  }

  .account-navigation {
    display: flex;
    overflow-x: auto;
    gap: 4px;
    padding-top: 7px;
  }

  .account-navigation button,
  .account-navigation a {
    min-height: 35px;
    flex: 0 0 auto;
    gap: 6px;
    padding: 7px;
    font-size: 0.68rem;
  }

  .account-navigation .account-logout {
    margin-top: 0;
  }

  .account-heading {
    align-items: flex-start;
  }

  .account-help-card {
    min-width: 0;
    padding: 8px;
  }

  .account-help-card small {
    display: none;
  }

  .account-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .account-dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .account-secondary-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .dashboard-wishlist-panel {
    grid-column: 1 / -1;
  }

  .orders-table {
    min-width: 590px;
  }

  .account-benefits {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .account-benefits > div:nth-child(4) {
    border-left: 0;
  }
}

@media (max-width: 520px) {
  .account-layout {
    padding-top: 12px;
  }

  .account-heading {
    display: grid;
  }

  .account-heading h1,
  .section-page-heading h1 {
    font-size: 1.35rem;
  }

  .account-help-card {
    width: fit-content;
  }

  .account-stats {
    gap: 8px;
  }

  .stat-card {
    min-height: 72px;
    grid-template-columns: 40px minmax(0, 1fr);
    column-gap: 7px;
    padding: 7px;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
  }

  .stat-link {
    font-size: 0.57rem;
  }

  .account-secondary-column {
    grid-template-columns: minmax(0, 1fr);
  }

  .dashboard-wishlist-panel {
    grid-column: auto;
  }

  .section-page-heading {
    align-items: flex-start;
  }

  .section-page-heading p {
    font-size: 0.72rem;
  }

  .section-page-heading .primary-button {
    flex: 0 0 auto;
    padding: 7px 8px;
    font-size: 0.67rem;
  }

  .address-form,
  .saved-address-grid,
  .wishlist-product-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .account-benefits {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .account-benefits > div {
    justify-content: flex-start;
    padding: 5px;
  }

  .account-benefits > div + div {
    border-left: 0;
  }
}
</style>
