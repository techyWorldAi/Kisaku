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

          <div class="auth-provider-divider"><span>or continue with</span></div>
          <button type="button" class="auth-google-button" @click="showGoogleUnavailable">
            <svg class="auth-google-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11c-.5 2.7-2 5-4.4 6.5v5.4h7.1c4.2-3.9 6.6-9.6 6.6-15.9z" />
              <path fill="#34A853" d="M24 44c5.9 0 10.9-2 14.5-5.5l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-8.9H4.4v5.6C8 36.8 15.3 44 24 44z" />
              <path fill="#FBBC05" d="M11.8 26.3c-.4-1.3-.6-2.7-.6-4.2s.2-2.9.6-4.2v-5.6H4.4C2.9 15.2 2 19.2 2 22.1s.9 6.9 2.4 9.8l7.4-5.6z" />
              <path fill="#EA4335" d="M24 8.9c3.2 0 6.1 1.1 8.3 3.2l6.2-6.2C34.7 2.3 29.8 0 24 0 15.3 0 8 4.8 4.4 12.3l7.4 5.6C13.5 12.8 18.3 8.9 24 8.9z" />
            </svg>
            Continue with Google
          </button>
          <p v-if="googleMessage" class="auth-provider-message" role="status">{{ googleMessage }}</p>

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
const googleMessage = ref('');

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

function showGoogleUnavailable() {
  googleMessage.value = 'Google sign-in is not set up yet. Please sign in with your email and password.';
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