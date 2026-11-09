<template>
  <main class="auth-page">
    <div class="auth-layout">
      <aside class="auth-brand-panel">
        <router-link to="/" class="auth-brand" aria-label="Kisaku Supply Agencies home">
          <img
            class="auth-brand-logo"
            src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
            alt="Kisaku Supply Agencies"
          />
        </router-link>
        <div class="auth-brand-message">
          <h1>Welcome back to smarter shopping.</h1>
          <p>Sign in to pick up where you left off, manage your orders, and discover everyday essentials.</p>
        </div>
        <span class="auth-brand-foot">Everyday products. Great prices. Delivered to you.</span>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
          <h2 class="auth-form-heading">Sign in to your account</h2>
          <p class="auth-form-subtitle">Access your account to continue shopping and track your orders.</p>

          <section v-if="demoMode" class="auth-demo-panel">
            <h2>Local demo accounts</h2>
            <p>Try shopping, administration, or staff order handling. Changes stay in this browser.</p>
            <div class="auth-demo-options" aria-label="Choose a demo account">
              <button
                v-for="account in demoAccounts"
                :key="account.role"
                type="button"
                class="capitalize"
                :aria-pressed="selectedDemoAccount.role === account.role"
                @click="selectedDemoAccount = account"
              >
                {{ account.role }}
              </button>
            </div>
            <dl class="auth-demo-credentials">
              <dt>Email</dt>
              <dd>{{ selectedDemoAccount.email }}</dd>
              <dt>Password</dt>
              <dd>{{ selectedDemoAccount.password }}</dd>
            </dl>
            <button type="button" class="auth-demo-fill" @click="fillDemoAccount(selectedDemoAccount)">
              Fill login details
            </button>
            <div>
              <button type="button" class="auth-demo-reset" @click="resetDemoStore">
                Reset demo data
              </button>
            </div>
          </section>

          <div v-if="error" class="auth-message auth-message-error" role="alert">
            {{ error }}
          </div>
          <div v-if="statusMessage" class="auth-message auth-message-success" role="status">
            {{ statusMessage }}
          </div>

          <form class="auth-form" @submit.prevent="handleLogin">
            <div class="auth-field">
              <label for="email">Email address</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="you@example.com"
                :disabled="loading"
              />
            </div>
            <div class="auth-field">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="Enter your password"
                :disabled="loading"
              />
            </div>
            <button type="submit" class="auth-submit" :disabled="loading">
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="auth-form-footer">
            Don't have an account?
            <router-link to="/signup">Create one</router-link>
          </p>
          <router-link to="/" class="auth-home-link">Continue browsing the store</router-link>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { isDemoMode, resetDemoData } from '../../services/demoStore';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const statusMessage = ref('');

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const demoMode = isDemoMode();
const demoAccounts = [
  { role: 'customer', email: 'customer@kisaku.test', password: 'KisakuDemo123!' },
  { role: 'admin', email: 'admin@kisaku.test', password: 'KisakuAdmin123!' },
  { role: 'staff', email: 'staff@kisaku.test', password: 'KisakuStaff123!' },
] as const;
const selectedDemoAccount = ref<(typeof demoAccounts)[number]>(demoAccounts[0]);

function fillDemoAccount(account: (typeof demoAccounts)[number]) {
  email.value = account.email;
  password.value = account.password;
  error.value = '';
}

function resetDemoStore() {
  resetDemoData();
  authStore.logout();
  error.value = '';
  statusMessage.value = 'Demo data has been reset. Your sample products and order history are restored.';
}

async function handleLogin() {
  if (loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    const authResponse = await authStore.login({
      email: email.value,
      password: password.value,
    });
    const redirect = route.query.redirect;
    const safeRedirect = typeof redirect === 'string'
      && redirect.startsWith('/')
      && !redirect.startsWith('//')
      && !['/login', '/signup'].includes(redirect)
      ? redirect
      : null;
    const defaultDestination = authResponse.user.role === 'sales_agent'
      ? '/admin/sales'
      : authResponse.user.role === 'admin' || authResponse.user.role === 'staff'
        ? '/admin/dashboard'
        : '/';
    await router.push(safeRedirect ?? defaultDestination);
  } catch (err: any) {
    if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Login failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>