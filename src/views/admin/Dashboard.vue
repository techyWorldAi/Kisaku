<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  Package,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-vue-next';
import { adminAPI } from '../../services/api';
import type { AdminDashboardSummary } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'custom';

const authStore = useAuthStore();
const router = useRouter();
const summary = ref<AdminDashboardSummary | null>(null);
const loading = ref(true);
const loadError = ref('');
const dateRange = ref<DateRange>('month');
const customStart = ref('');
const customEnd = ref('');
const searchQuery = ref('');

const customerCount = computed(() => summary.value?.customer_count ?? 0);
const pendingOrders = computed(() => summary.value?.pending_order_count ?? 0);
const deliveredOrders = computed(() => summary.value?.delivered_order_count ?? 0);
const cancelledOrders = computed(() => summary.value?.cancelled_order_count ?? 0);
const deliveredOrderValue = computed(() => summary.value?.delivered_order_value ?? 0);
const lowStockProducts = computed(() =>
  (summary.value?.low_stock_products ?? []).filter((product) => product.stock > 0),
);
const outOfStockProducts = computed(() =>
  (summary.value?.low_stock_products ?? []).filter((product) => product.stock <= 0),
);

const recentOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return [...(summary.value?.recent_orders ?? [])]
    .filter((order) => {
      if (!query) return true;
      return String(order.id).includes(query)
        || (order.user?.name ?? '').toLowerCase().includes(query)
        || (order.user?.email ?? '').toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
});

const orderTrend = computed(() => {
  const days = summary.value?.order_trend.map((point) => ({
    label: new Date(`${point.date}T12:00:00`).toLocaleDateString('en-KE', { weekday: 'short' }),
    count: point.count,
  })) ?? [];
  const max = Math.max(...days.map((day) => day.count), 1);
  return days.map((day) => ({ ...day, height: `${Math.max((day.count / max) * 100, day.count ? 12 : 4)}%` }));
});

function formatCurrency(value: number) {
  return `KES ${value.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };
  return classes[status] ?? 'status-default';
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateBounds(range: DateRange) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  let start = new Date(today);

  if (range === 'week') start.setDate(start.getDate() - 6);
  if (range === 'month') start.setDate(1);
  if (range === 'quarter') start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  if (range === 'custom') {
    if (!customStart.value || !customEnd.value || customStart.value > customEnd.value) return null;
    return { from: customStart.value, to: customEnd.value };
  }
  return { from: formatInputDate(start), to: formatInputDate(end) };
}

function applyPreset(range: DateRange) {
  dateRange.value = range;
  if (range !== 'custom') void fetchDashboardData(range);
}

async function fetchDashboardData(range: DateRange = dateRange.value) {
  const bounds = getDateBounds(range);
  if (!bounds) {
    summary.value = null;
    loadError.value = 'Choose a valid start and end date for the selected range.';
    return;
  }

  loading.value = true;
  loadError.value = '';
  summary.value = null;
  try {
    summary.value = await adminAPI.getDashboardSummary(bounds.from, bounds.to);
  } catch (error) {
    console.error('Failed to load admin dashboard data:', error);
    loadError.value = 'Dashboard data could not be loaded. Check your connection and try again.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!authStore.canAccessAdmin) {
    void router.replace('/profile');
    return;
  }
  void fetchDashboardData();
});
</script>

<template>
  <div class="admin-shell">
    <AdminSidebar :pending-orders="pendingOrders" />

    <div class="admin-content">
      <header class="topbar">
        <div class="breadcrumbs">Administration <span>/</span> Overview</div>
        <button class="refresh-button" :disabled="loading" @click="fetchDashboardData()">
          <ArrowUpRight :size="16" />
          <span>Refresh data</span>
        </button>
      </header>

      <main class="dashboard-main">
        <section class="page-heading">
          <div>
            <p class="page-eyebrow">YOUR TRUSTED SOURCING &amp; SUPPLY PARTNER</p>
            <h1>Overview</h1>
            <p class="page-subtitle">A live view of products, customers and order activity.</p>
          </div>
          <router-link to="/admin/products" class="primary-link">
            <Package :size="17" />
            Manage products
          </router-link>
        </section>

        <section class="date-toolbar" aria-label="Dashboard date range">
          <div class="date-presets">
            <button
              v-for="range in (['today', 'week', 'month', 'quarter'] as DateRange[])"
              :key="range"
              :class="{ selected: dateRange === range }"
              @click="applyPreset(range)"
            >
              {{ range === 'today' ? 'Today' : range === 'week' ? 'This week' : range === 'month' ? 'This month' : 'This quarter' }}
            </button>
            <button :class="{ selected: dateRange === 'custom' }" @click="applyPreset('custom')">Custom</button>
          </div>
          <div v-if="dateRange === 'custom'" class="custom-dates">
            <label>
              <span class="sr-only">Start date</span>
              <input v-model="customStart" type="date" aria-label="Start date" />
            </label>
            <span>to</span>
            <label>
              <span class="sr-only">End date</span>
              <input v-model="customEnd" type="date" aria-label="End date" />
            </label>
            <button class="apply-date-button" @click="fetchDashboardData('custom')">Apply</button>
          </div>
        </section>

        <div v-if="loadError" class="error-banner" role="alert">
          <span>{{ loadError }}</span>
          <button @click="fetchDashboardData()">Retry</button>
        </div>

        <div v-if="loading" class="metrics-grid" aria-label="Loading dashboard data">
          <div v-for="index in 4" :key="index" class="metric-skeleton" />
        </div>

        <template v-else-if="!loadError">
          <section
            class="metrics-grid"
            :class="{ 'staff-metrics-grid': !authStore.isAdmin }"
            aria-label="Commerce metrics"
          >
            <article class="metric-card">
              <div class="metric-label"><span>Products</span><Package :size="17" /></div>
              <strong class="metric-value">{{ summary?.product_count ?? 0 }}</strong>
              <span class="metric-detail">
                {{ summary?.low_stock_product_count ?? 0 }} running low ·
                {{ summary?.out_of_stock_product_count ?? 0 }} out of stock
              </span>
            </article>
            <article class="metric-card">
              <div class="metric-label"><span>Orders in period</span><ShoppingCart :size="17" /></div>
              <strong class="metric-value">{{ summary?.order_count ?? 0 }}</strong>
              <span class="metric-detail">{{ pendingOrders }} pending confirmation</span>
            </article>
            <article class="metric-card">
              <div class="metric-label"><span>Customers</span><Users :size="17" /></div>
              <strong class="metric-value">{{ customerCount }}</strong>
              <span class="metric-detail">Registered customer accounts</span>
            </article>
            <article v-if="authStore.isAdmin" class="metric-card">
              <div class="metric-label"><span>Delivered order value</span><Boxes :size="17" /></div>
              <strong class="metric-value metric-currency">{{ formatCurrency(deliveredOrderValue) }}</strong>
              <span class="metric-detail">Delivered orders · not payment-confirmed</span>
            </article>
          </section>

          <section class="supporting-metrics" aria-label="Order status overview">
            <article><span class="status-indicator pending" /><span>Pending</span><strong>{{ pendingOrders }}</strong></article>
            <article><span class="status-indicator delivered" /><span>Delivered</span><strong>{{ deliveredOrders }}</strong></article>
            <article><span class="status-indicator cancelled" /><span>Cancelled</span><strong>{{ cancelledOrders }}</strong></article>
          </section>

          <section class="dashboard-grid">
            <article class="panel trend-panel">
              <div class="panel-heading">
                <div>
                  <h2>Order activity</h2>
                  <p>Orders created over the last seven days</p>
                </div>
                <ClipboardList :size="19" />
              </div>
              <div class="chart-area" role="img" aria-label="Bar chart showing orders created per day over the last seven days">
                <div v-for="day in orderTrend" :key="day.label" class="chart-column">
                  <strong>{{ day.count }}</strong>
                  <div class="chart-track">
                    <span class="chart-bar" :style="{ height: day.height }" />
                  </div>
                  <small>{{ day.label }}</small>
                </div>
              </div>
            </article>

            <article class="panel inventory-panel">
              <div class="panel-heading">
                <div>
                  <h2>Inventory attention</h2>
                  <p>Products with five or fewer units</p>
                </div>
                <router-link to="/admin/products" aria-label="View inventory"><ArrowRight :size="18" /></router-link>
              </div>
              <div v-if="lowStockProducts.length || outOfStockProducts.length" class="inventory-list">
                <div
                  v-for="product in [...outOfStockProducts, ...lowStockProducts].slice(0, 5)"
                  :key="product.id"
                  class="inventory-row"
                >
                  <span class="inventory-icon"><Package :size="16" /></span>
                  <span class="inventory-name">{{ product.name }}</span>
                  <span :class="['inventory-quantity', product.stock <= 0 ? 'quantity-empty' : 'quantity-low']">
                    {{ product.stock }} left
                  </span>
                </div>
              </div>
              <div v-else class="compact-empty">No low-stock products in the current catalogue.</div>
            </article>
          </section>

          <section class="panel orders-panel">
            <div class="panel-heading orders-heading">
              <div>
                <h2>Recent orders</h2>
                <p>Latest customer activity in the selected period</p>
              </div>
              <div class="orders-actions">
                <label class="table-search">
                  <Search :size="16" />
                  <input v-model="searchQuery" type="search" placeholder="Search orders" aria-label="Search recent orders" />
                </label>
                <router-link to="/admin/orders" class="text-link">View all <ArrowRight :size="15" /></router-link>
              </div>
            </div>

            <div v-if="recentOrders.length" class="table-scroll">
              <table>
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th class="amount-cell">Amount</th></tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td class="order-number">#{{ order.id }}</td>
                    <td>
                      <strong>{{ order.user?.name ?? 'Customer' }}</strong>
                      <small>{{ order.user?.email ?? 'Customer details unavailable' }}</small>
                    </td>
                    <td>{{ formatDate(order.created_at) }}</td>
                    <td><span :class="['status-pill', statusClass(order.status)]">{{ order.status }}</span></td>
                    <td class="amount-cell">{{ formatCurrency(Number(order.total)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="compact-empty">No orders match this date range and search.</div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #f6f7f9;
  color: #102a43;
}

.admin-sidebar {
  position: fixed;
  z-index: 20;
  inset: 0 auto 0 0;
  display: flex;
  width: 246px;
  flex-direction: column;
  padding: 22px 14px 14px;
  border-right: 1px solid #e5e7eb;
  background: #fff;
}

.admin-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 0 9px 28px;
  color: #155da5;
  text-decoration: none;
}

.admin-brand small {
  margin-top: 5px;
  font-size: 0.53rem;
  font-weight: 750;
  letter-spacing: 0.1em;
}

.nav-caption {
  margin: 0 10px 9px;
  color: #94a3b8;
  font-size: 0.64rem;
  font-weight: 750;
  letter-spacing: 0.11em;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-nav-link {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 11px;
  padding: 0 11px;
  border-radius: 6px;
  color: #526579;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
}

.admin-nav-link:hover {
  background: #f6f7f9;
  color: #155da5;
}

.admin-nav-link.nav-active {
  background: #edf4fa;
  color: #155da5;
}

.nav-count {
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  border-radius: 999px;
  background: #fff1e0;
  color: #a64e00;
  font-size: 0.68rem;
}

.sidebar-bottom {
  margin-top: auto;
  padding: 14px 6px 0;
  border-top: 1px solid #eef0f2;
}

.signed-in {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 5px 13px;
}

.avatar {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e8f0f8;
  color: #155da5;
  font-weight: 750;
}

.signed-in-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.signed-in-copy strong {
  overflow: hidden;
  color: #102a43;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signed-in-copy small {
  color: #64748b;
  font-size: 0.68rem;
}

.logout-button {
  display: flex;
  width: 100%;
  min-height: 39px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font: inherit;
  font-size: 0.82rem;
  text-align: left;
  cursor: pointer;
}

.logout-button:hover {
  background: #fef2f2;
  color: #b42318;
}

.admin-content {
  min-height: 100vh;
  margin-left: 246px;
}

.topbar {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(20px, 3vw, 42px);
  border-bottom: 1px solid #e5e7eb;
  background: rgb(255 255 255 / 96%);
}

.breadcrumbs {
  color: #64748b;
  font-size: 0.8rem;
}

.breadcrumbs span {
  padding: 0 7px;
  color: #cbd5e1;
}

.refresh-button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #fff;
  color: #42566b;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 650;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.mobile-nav-button {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #fff;
  color: #102a43;
}

.dashboard-main {
  width: min(1380px, 100%);
  margin: 0 auto;
  padding: 30px clamp(20px, 3vw, 42px) 50px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 23px;
}

.page-eyebrow {
  margin: 0 0 7px;
  color: #155da5;
  font-size: 0.65rem;
  font-weight: 750;
  letter-spacing: 0.1em;
}

.page-heading h1 {
  margin: 0;
  color: #102a43;
  font-size: 1.7rem;
  font-weight: 760;
  letter-spacing: -0.035em;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.primary-link {
  display: inline-flex;
  min-height: 39px;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border-radius: 6px;
  background: #ff8500;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.primary-link:hover {
  background: #e87500;
}

.date-toolbar {
  display: flex;
  min-height: 55px;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
}

.date-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.date-presets button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  font: inherit;
  font-size: 0.74rem;
  cursor: pointer;
}

.date-presets button:hover {
  background: #f6f7f9;
  color: #155da5;
}

.date-presets button.selected {
  background: #edf4fa;
  color: #155da5;
  font-weight: 700;
}

.custom-dates {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 0.75rem;
}

.custom-dates input {
  max-width: 140px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #334155;
  font: inherit;
  font-size: 0.72rem;
}

.apply-date-button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: #155da5;
  color: #fff;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.apply-date-button:hover {
  background: #104c89;
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.82rem;
}

.error-banner button {
  border: 0;
  background: none;
  color: #991b1b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.metrics-grid.staff-metrics-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card,
.metric-skeleton {
  min-height: 130px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
}

.metric-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 600;
}

.metric-label svg {
  color: #155da5;
}

.metric-value {
  display: block;
  margin-top: 14px;
  color: #102a43;
  font-size: clamp(1.45rem, 2.2vw, 1.9rem);
  font-weight: 760;
  letter-spacing: -0.04em;
}

.metric-currency {
  font-size: clamp(1.16rem, 1.8vw, 1.5rem);
}

.metric-detail {
  display: block;
  margin-top: 5px;
  color: #7b8b9b;
  font-size: 0.68rem;
}

.metric-skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #fff 25%, #f6f7f9 50%, #fff 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}

.supporting-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 23px;
  margin: 14px 0 20px;
  padding: 13px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
}

.supporting-metrics article {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 0.75rem;
}

.supporting-metrics strong {
  margin-left: 2px;
  color: #102a43;
}

.status-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-indicator.pending { background: #d97706; }
.status-indicator.delivered { background: #16834a; }
.status-indicator.cancelled { background: #dc2626; }

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.9fr);
  gap: 14px;
  margin-bottom: 14px;
}

.panel {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
}

.trend-panel,
.inventory-panel {
  min-height: 285px;
  padding: 17px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.panel-heading h2 {
  margin: 0;
  color: #102a43;
  font-size: 0.94rem;
  font-weight: 730;
}

.panel-heading p {
  margin: 5px 0 0;
  color: #8291a1;
  font-size: 0.72rem;
}

.panel-heading > svg,
.panel-heading > a {
  color: #64748b;
}

.panel-heading > a:hover {
  color: #155da5;
}

.chart-area {
  display: grid;
  height: 190px;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
  margin-top: 20px;
  padding: 0 4px;
}

.chart-column {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.chart-column strong {
  color: #64748b;
  font-size: 0.65rem;
}

.chart-track {
  display: flex;
  width: min(35px, 100%);
  height: 145px;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px 4px 0 0;
  background: #f1f5f9;
}

.chart-bar {
  display: block;
  width: 100%;
  min-height: 3px;
  border-radius: 4px 4px 0 0;
  background: #155da5;
  transition: height 180ms ease;
}

.chart-column small {
  color: #8291a1;
  font-size: 0.67rem;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  margin-top: 17px;
}

.inventory-row {
  display: flex;
  min-height: 43px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #f1f3f5;
}

.inventory-row:last-child {
  border-bottom: 0;
}

.inventory-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: #f0f5fa;
  color: #155da5;
}

.inventory-name {
  overflow: hidden;
  flex: 1;
  color: #42566b;
  font-size: 0.77rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-quantity {
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.quantity-low { color: #a64e00; }
.quantity-empty { color: #b42318; }

.compact-empty {
  padding: 28px 10px;
  color: #8291a1;
  font-size: 0.8rem;
  text-align: center;
}

.orders-panel {
  margin-top: 14px;
}

.orders-heading {
  align-items: center;
  padding: 17px;
  border-bottom: 1px solid #eef0f2;
}

.orders-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.table-search {
  display: flex;
  width: 190px;
  height: 34px;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  color: #8291a1;
}

.table-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #334155;
  font: inherit;
  font-size: 0.74rem;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #155da5;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  height: 39px;
  padding: 0 17px;
  background: #fafbfc;
  color: #8291a1;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  height: 57px;
  padding: 8px 17px;
  border-top: 1px solid #f1f3f5;
  color: #526579;
  font-size: 0.75rem;
  white-space: nowrap;
}

td strong,
td small {
  display: block;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
}

td strong {
  color: #334155;
  font-size: 0.76rem;
  font-weight: 650;
}

td small {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 0.67rem;
}

.order-number {
  color: #155da5;
  font-weight: 700;
}

.amount-cell {
  text-align: right;
  color: #102a43;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-pending { background: #fff7e6; color: #9a5700; }
.status-confirmed { background: #edf4fa; color: #155da5; }
.status-shipped { background: #f1edfa; color: #6441a5; }
.status-delivered { background: #e8f5ed; color: #16834a; }
.status-cancelled { background: #fef0ef; color: #b42318; }
.status-default { background: #f1f3f5; color: #526579; }

.sidebar-scrim {
  display: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@media (max-width: 1050px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-scrim {
    position: fixed;
    z-index: 15;
    inset: 0;
    display: block;
    border: 0;
    background: rgb(16 42 67 / 35%);
  }

  .admin-content {
    margin-left: 0;
  }

  .mobile-nav-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .topbar {
    justify-content: flex-start;
    gap: 12px;
  }

  .breadcrumbs {
    margin-left: 48px;
  }

  .refresh-button {
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .topbar {
    height: 54px;
    padding: 0 14px;
  }

  .breadcrumbs {
    font-size: 0.7rem;
  }

  .refresh-button {
    width: 35px;
    justify-content: center;
    padding: 0;
  }

  .refresh-button span {
    display: none;
  }

  .dashboard-main {
    padding: 23px 14px 35px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-heading h1 {
    font-size: 1.5rem;
  }

  .date-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 9px;
  }

  .date-presets {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }

  .date-presets button {
    padding: 0 6px;
    font-size: 0.69rem;
  }

  .custom-dates {
    width: 100%;
    justify-content: space-between;
  }

  .custom-dates input {
    width: min(37vw, 140px);
  }

  .metrics-grid {
    gap: 9px;
  }

  .metric-card {
    min-height: 117px;
    padding: 12px;
  }

  .metric-label {
    font-size: 0.69rem;
  }

  .metric-value {
    margin-top: 12px;
    font-size: 1.35rem;
  }

  .metric-currency {
    font-size: 1.03rem;
  }

  .metric-detail {
    font-size: 0.62rem;
    line-height: 1.4;
  }

  .supporting-metrics {
    gap: 12px;
    padding: 11px;
  }

  .supporting-metrics article {
    font-size: 0.68rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .orders-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .orders-actions {
    width: 100%;
    justify-content: space-between;
  }

  .table-search {
    width: min(65%, 220px);
  }

  th,
  td {
    padding-right: 12px;
    padding-left: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
