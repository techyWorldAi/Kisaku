<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Boxes, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, UserRound, X } from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';

const authStore = useAuthStore();
const router = useRouter();
const mobileOpen = ref(false);
const navigation = [
  { label: 'Dashboard', to: '/vendor', icon: LayoutDashboard, exact: true },
  { label: 'My Products', to: '/vendor/products', icon: Package },
  { label: 'Orders', to: '/vendor/orders', icon: ShoppingBag },
  { label: 'Profile', to: '/vendor/profile', icon: UserRound },
];

const displayName = computed(() => authStore.user?.name ?? 'Vendor');
function signOut() {
  authStore.logout();
  void router.push('/login');
}
</script>

<template>
  <div class="vendor-shell">
    <button type="button" class="vendor-mobile-toggle" :aria-expanded="mobileOpen" aria-label="Toggle vendor navigation" @click="mobileOpen = !mobileOpen">
      <X v-if="mobileOpen" :size="20" /><Menu v-else :size="20" />
    </button>
    <button v-if="mobileOpen" type="button" class="vendor-scrim" aria-label="Close vendor navigation" @click="mobileOpen = false" />
    <aside class="vendor-sidebar" :class="{ open: mobileOpen }">
      <router-link to="/vendor" class="vendor-brand">
        <img src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png" alt="Kisaku Supply Agencies" />
        <small>VENDOR PORTAL</small>
      </router-link>
      <nav class="vendor-nav" aria-label="Vendor portal">
        <router-link v-for="item in navigation" :key="item.to" :to="item.to" class="vendor-nav-link" :class="{ active: item.exact ? $route.path === item.to : $route.path.startsWith(item.to) }" @click="mobileOpen = false">
          <component :is="item.icon" :size="19" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="vendor-sidebar-bottom">
        <div class="vendor-user">
          <span class="vendor-avatar">{{ displayName.slice(0, 1).toUpperCase() }}</span>
          <span><strong>{{ displayName }}</strong><small>Vendor</small></span>
        </div>
        <button type="button" class="vendor-logout" @click="signOut"><LogOut :size="17" />Sign out</button>
      </div>
    </aside>
    <div class="vendor-content">
      <header class="vendor-topbar">
        <router-link to="/shop" class="vendor-shop-link"><Boxes :size="17" />Shop</router-link>
        <span class="vendor-header-code">Vendor Portal</span>
      </header>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.vendor-shell{min-height:100vh;background:#f6f8fb;color:#0f2a44}.vendor-sidebar{position:fixed;z-index:40;inset:0 auto 0 0;width:246px;padding:22px 14px 14px;background:#fff;border-right:1px solid #e3e8ee;display:flex;flex-direction:column}.vendor-brand{display:flex;flex-direction:column;gap:4px;padding:0 9px 26px;text-decoration:none}.vendor-brand img{width:190px}.vendor-brand small{color:#64748b;font-size:.58rem;font-weight:800;letter-spacing:.1em}.vendor-nav{display:flex;flex-direction:column;gap:5px}.vendor-nav-link{min-height:44px;display:flex;align-items:center;gap:11px;padding:0 11px;border-radius:6px;color:#526579;text-decoration:none;font-size:.86rem;font-weight:650}.vendor-nav-link.active,.vendor-nav-link:hover{background:#edf4fa;color:#075397}.vendor-sidebar-bottom{margin-top:auto;border-top:1px solid #eef0f2;padding-top:14px}.vendor-user{display:flex;align-items:center;gap:10px;padding:0 5px 12px}.vendor-avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e8f0f8;color:#075397;font-weight:800}.vendor-user span:last-child{display:flex;flex-direction:column}.vendor-user small{color:#64748b}.vendor-logout{width:100%;height:42px;border:0;border-radius:6px;background:#f3f6f9;color:#526579;display:flex;align-items:center;justify-content:center;gap:8px}.vendor-content{min-height:100vh;margin-left:246px}.vendor-topbar{height:58px;padding:0 28px;border-bottom:1px solid #e6ebf1;background:#fff;display:flex;align-items:center;justify-content:flex-end;gap:16px}.vendor-shop-link{display:flex;align-items:center;gap:7px;color:#075397;text-decoration:none;font-weight:700}.vendor-header-code{color:#64748b;font-size:.78rem}.vendor-mobile-toggle,.vendor-scrim{display:none}@media(max-width:760px){.vendor-sidebar{transform:translateX(-100%);transition:transform .2s}.vendor-sidebar.open{transform:translateX(0)}.vendor-content{margin-left:0}.vendor-mobile-toggle{display:grid;position:fixed;z-index:50;top:10px;left:12px;width:38px;height:38px;place-items:center;border:1px solid #dce4ec;border-radius:6px;background:#fff;color:#075397}.vendor-scrim{display:block;position:fixed;z-index:35;inset:0;border:0;background:rgba(15,42,68,.35)}.vendor-topbar{padding-left:60px}.vendor-header-code{display:none}}
</style>