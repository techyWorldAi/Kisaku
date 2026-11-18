<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Boxes, CheckCircle2, ClipboardList, Package, Plus, ShoppingBag, UserRound } from 'lucide-vue-next';
import { vendorAPI } from '../../services/api';
import type { Vendor } from '../../services/api';

const loading = ref(true);
const error = ref('');
const vendor = ref<Vendor | null>(null);
const orders = ref<Record<string, number>>({});
const products = ref<Record<string, number>>({});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await vendorAPI.getDashboard();
    vendor.value = data.vendor;
    orders.value = data.orders;
    products.value = data.products;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Dashboard data could not be loaded.';
  } finally { loading.value = false; }
}
function count(value: number | undefined) { return value ?? 0; }
onMounted(load);
</script>

<template>
  <main class="vendor-main">
    <section class="vendor-hero">
      <div>
        <p class="eyebrow">VENDOR PORTAL</p>
        <h1>Welcome, {{ vendor?.business_name || 'Vendor' }}</h1>
        <span class="vendor-code">Vendor Code: {{ vendor?.code || 'Loading...' }}</span>
      </div>
      <div class="hero-visual"><ShoppingBag :size="86" /><Boxes :size="64" /></div>
    </section>

    <div v-if="error" class="vendor-alert">{{ error }}</div>
    <div v-else-if="loading" class="vendor-loading">Loading dashboard...</div>
    <template v-else>
      <section class="metric-grid">
        <router-link to="/vendor/products" class="metric-card"><span class="metric-icon blue"><Package /></span><div><strong>{{ count(products.active) + count(products.pending) + count(products.disabled) + count(products.out_of_stock) }}</strong><small>Your Products</small></div><span class="metric-link">Manage products &rarr;</span></router-link>
        <router-link to="/vendor/orders?status=pending" class="metric-card"><span class="metric-icon orange"><ShoppingBag /></span><div><strong>{{ count(orders.pending) }}</strong><small>Pending Orders</small></div><span class="metric-link">View orders &rarr;</span></router-link>
        <router-link to="/vendor/orders?status=received" class="metric-card"><span class="metric-icon green"><CheckCircle2 /></span><div><strong>{{ count(orders.received) }}</strong><small>Received Orders</small></div><span class="metric-link">View orders &rarr;</span></router-link>
        <router-link to="/vendor/products?status=disabled" class="metric-card"><span class="metric-icon navy"><Boxes /></span><div><strong>{{ count(products.disabled) }}</strong><small>Disabled Products</small></div><span class="metric-link">Review &rarr;</span></router-link>
      </section>

      <section class="dashboard-grid">
        <article class="dashboard-panel">
          <header><h2>Your Products</h2><router-link to="/vendor/products">View All &rarr;</router-link></header>
          <div class="product-summary"><div><strong>{{ count(products.active) }}</strong><span>Active</span></div><div><strong>{{ count(products.pending) }}</strong><span>Pending</span></div><div><strong>{{ count(products.disabled) }}</strong><span>Disabled</span></div><div><strong>{{ count(products.out_of_stock) }}</strong><span>Out of stock</span></div></div>
          <router-link v-if="count(products.disabled)" to="/vendor/products?status=disabled" class="disabled-note">Kisaku has disabled {{ count(products.disabled) }} product{{ count(products.disabled) === 1 ? '' : 's' }}.</router-link>
        </article>
        <article class="dashboard-panel">
          <header><h2>Recent Orders</h2><router-link to="/vendor/orders">View All &rarr;</router-link></header>
          <div class="order-summary"><router-link to="/vendor/orders?status=pending"><span>Pending</span><strong>{{ count(orders.pending) }}</strong></router-link><router-link to="/vendor/orders?status=confirmed"><span>Confirmed</span><strong>{{ count(orders.confirmed) }}</strong></router-link><router-link to="/vendor/orders?status=shipped"><span>Sent to store</span><strong>{{ count(orders.shipped) }}</strong></router-link></div>
        </article>
      </section>

      <section class="quick-actions"><h2>Quick Actions</h2><div><router-link to="/vendor/products/new"><Plus />Add Product</router-link><router-link to="/vendor/products"><Package />Manage Products</router-link><router-link to="/vendor/orders"><ClipboardList />View Orders</router-link><router-link to="/vendor/profile"><UserRound />Profile</router-link></div></section>
    </template>
  </main>
</template>


<style scoped>
.vendor-main{padding:18px 28px 32px}.vendor-hero{min-height:155px;border-radius:8px;background:linear-gradient(112deg,#eaf3fb 0%,#dceafa 70%,#fff 70%,#fff 100%);display:flex;align-items:center;justify-content:space-between;padding:25px 34px;margin-bottom:20px;overflow:hidden}.eyebrow{margin:0 0 7px;color:#075397;font-size:.68rem;font-weight:800;letter-spacing:.08em}.vendor-hero h1{margin:0 0 10px;font-size:1.65rem}.vendor-code{display:inline-flex;padding:7px 11px;border-radius:999px;background:#fff;color:#075397;font-size:.78rem;font-weight:800}.hero-visual{display:flex;align-items:flex-end;gap:12px;color:#ff7900}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.metric-card{min-height:112px;padding:16px;border:1px solid #e6ebf1;border-radius:8px;background:#fff;text-decoration:none;color:#0f2a44;display:grid;grid-template-columns:48px 1fr;align-items:center}.metric-icon{width:44px;height:44px;border-radius:50%;display:grid;place-items:center}.metric-icon.blue{background:#edf4fa;color:#075397}.metric-icon.orange{background:#fff0df;color:#ff7900}.metric-icon.green{background:#e8f7ef;color:#15803d}.metric-icon.navy{background:#edf0f5;color:#0f2a44}.metric-card div{display:flex;flex-direction:column}.metric-card strong{font-size:1.45rem}.metric-card small{color:#64748b}.metric-link{grid-column:2;color:#075397;font-size:.78rem;font-weight:750}.dashboard-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.dashboard-panel{min-height:180px;padding:18px;border:1px solid #e6ebf1;border-radius:8px;background:#fff}.dashboard-panel header{display:flex;justify-content:space-between}.dashboard-panel h2,.quick-actions h2{margin:0;font-size:1rem}.dashboard-panel header a{color:#075397;text-decoration:none;font-size:.78rem;font-weight:800}.product-summary,.order-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:25px}.product-summary div,.order-summary a{display:flex;flex-direction:column;padding:12px;border-radius:6px;background:#f7f9fb;text-decoration:none;color:#0f2a44}.product-summary strong,.order-summary strong{font-size:1.15rem}.product-summary span,.order-summary span{color:#64748b;font-size:.72rem}.disabled-note{display:block;margin-top:14px;padding:9px;border-radius:6px;background:#fff1f1;color:#b42318;text-decoration:none}.quick-actions{margin-top:16px;padding:18px;border:1px solid #e6ebf1;border-radius:8px;background:#fff}.quick-actions div{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}.quick-actions a{min-height:74px;border:1px solid #edf0f3;border-radius:6px;color:#075397;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;font-size:.82rem;font-weight:750}.vendor-loading,.vendor-alert{padding:18px;border-radius:8px;background:#fff}.vendor-alert{color:#b42318}@media(max-width:1050px){.metric-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.vendor-main{padding:14px}.vendor-hero{min-height:145px;padding:20px}.hero-visual{display:none}.metric-grid,.dashboard-grid{grid-template-columns:1fr}.quick-actions div{grid-template-columns:repeat(2,1fr)}}
</style>