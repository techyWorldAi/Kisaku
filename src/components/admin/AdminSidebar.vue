<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  UserRoundCog,
  Users,
  X,
} from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';

withDefaults(defineProps<{ pendingOrders?: number }>(), { pendingOrders: 0 });

const authStore = useAuthStore();
const router = useRouter();
const mobileOpen = ref(false);

const navigation = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Accounts', to: '/admin/users', icon: Users },
  { label: 'Employees', to: '/admin/users?view=employees', icon: UserRoundCog },
];

function signOut() {
  authStore.logout();
  void router.push('/login');
}
</script>

<template>
  <button
    type="button"
    class="admin-mobile-toggle"
    :aria-expanded="mobileOpen"
    aria-label="Toggle admin navigation"
    @click="mobileOpen = !mobileOpen"
  >
    <X v-if="mobileOpen" :size="20" />
    <Menu v-else :size="20" />
  </button>

  <button
    v-if="mobileOpen"
    type="button"
    class="admin-sidebar-scrim"
    aria-label="Close admin navigation"
    @click="mobileOpen = false"
  />

  <aside class="admin-sidebar" :class="{ 'sidebar-open': mobileOpen }">
    <router-link to="/admin/dashboard" class="admin-brand" aria-label="Kisaku admin home">
      <img
        class="admin-brand-logo"
        src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
        alt="Kisaku Supply Agencies"
      />
      <small class="admin-brand-label">ADMINISTRATION</small>
    </router-link>

    <p class="nav-caption">WORKSPACE</p>
    <nav class="admin-nav" aria-label="Administration">
      <router-link
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="admin-nav-link"
        :class="{ 'nav-active': $route.fullPath === item.to }"
        @click="mobileOpen = false"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
        <span v-if="item.label === 'Orders' && pendingOrders > 0" class="nav-count">
          {{ pendingOrders }}
        </span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <div class="signed-in">
        <span class="avatar">{{ authStore.user?.name?.slice(0, 1).toUpperCase() ?? 'S' }}</span>
        <span class="signed-in-copy">
          <strong>{{ authStore.user?.name ?? 'Staff member' }}</strong>
          <small>{{ authStore.isAdmin ? 'Administrator' : 'Staff' }}</small>
        </span>
      </div>
      <button class="logout-button" type="button" @click="signOut">
        <LogOut :size="17" />
        <span>Sign out</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  position: fixed;
  z-index: 40;
  inset: 0 auto 0 0;
  display: flex;
  width: 246px;
  flex-direction: column;
  padding: 22px 14px 14px;
  border-right: 1px solid #e3e8ee;
  background: #fff;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 9px 28px;
  color: #075397;
  text-decoration: none;
}

.admin-brand-logo {
  display: block;
  width: 205px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.admin-brand-label {
  margin-top: 5px;
  margin-left: 3px;
  color: #64748b;
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
  min-height: 44px;
  align-items: center;
  gap: 11px;
  padding: 0 11px;
  border-radius: 5px;
  color: #526579;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
}

.admin-nav-link:hover,
.admin-nav-link.nav-active {
  background: #edf4fa;
  color: #075397;
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
  color: #075397;
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
  color: #102c49;
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
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
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

.admin-mobile-toggle,
.admin-sidebar-scrim {
  display: none;
}

@media (max-width: 800px) {
  .admin-mobile-toggle {
    position: fixed;
    z-index: 42;
    top: 9px;
    left: 12px;
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border: 1px solid #e3e8ee;
    border-radius: 5px;
    background: #fff;
    color: #102c49;
    cursor: pointer;
  }

  .admin-sidebar {
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .admin-sidebar-scrim {
    position: fixed;
    z-index: 44;
    inset: 0;
    display: block;
    border: 0;
    background: rgb(16 44 73 / 38%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar {
    transition-duration: 0.01ms;
  }
}
</style>
