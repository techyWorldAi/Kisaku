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
        <div class="auth-brand-support">
          <span aria-hidden="true">Need help?</span>
          <a href="/contact">Contact support &rarr;</a>
        </div>
        <div class="auth-brand-message">
          <h1>Keep an eye<br />on your <span>orders</span></h1>
          <p>Track your purchases, get updates and enjoy a seamless shopping experience.</p>
          <ul>
            <li>Fast &amp; secure shopping</li>
            <li>Easy order tracking</li>
            <li>Reliable support</li>
          </ul>
        </div>
        <span class="auth-brand-foot">Everyday products. Great prices. Delivered to you.</span>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
          <router-link to="/" class="auth-mobile-brand" aria-label="Kisaku Supply Agencies home">
            <img src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png" alt="Kisaku" />
          </router-link>
          <h2 class="auth-form-heading">Welcome Back</h2>
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
            <router-link to="/forgot-password" class="auth-forgot-link">Forgot password?</router-link>
            <button type="submit" class="auth-submit" :disabled="loading">
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <div class="auth-provider-divider"><span>or continue with</span></div>
          <div ref="googleButton" class="auth-google-button-container" aria-label="Continue with Google"></div>
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

<style scoped>
.auth-forgot-link { display: block; margin: -4px 0 10px; color: #075397; font-size: 0.82rem; font-weight: 700; text-align: right; }
.auth-google-button-container { display: flex; justify-content: center; min-height: 44px; }
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { isDemoMode, resetDemoData } from '../../services/demoStore';
import { loadGoogleIdentityServices } from '../../services/googleAuth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const statusMessage = ref('');
const googleMessage = ref('');
const googleButton = ref<HTMLElement | null>(null);

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

onMounted(async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    googleMessage.value = 'Google sign-in is not configured.';
    return;
  }

  try {
    await loadGoogleIdentityServices();
    if (!googleButton.value || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButton.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 320,
    });
  } catch (err: unknown) {
    googleMessage.value = err instanceof Error ? err.message : 'Google sign-in could not be loaded.';
  }
});

async function handleGoogleCredential(response: { credential: string }) {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  googleMessage.value = '';

  try {
    const authResponse = await authStore.googleLogin({ credential: response.credential });
    const redirect = route.query.redirect;
    const safeRedirect = typeof redirect === 'string'
      && redirect.startsWith('/')
      && !redirect.startsWith('//')
      && !['/login', '/signup'].includes(redirect)
      ? redirect
      : null;
    const defaultDestination = authResponse.user.role === 'vendor'
      ? '/vendor'
      : authResponse.user.role === 'sales_agent'
        ? '/admin/sales'
        : authResponse.user.role === 'admin'
          || authResponse.user.role === 'staff'
          || authResponse.user.role === 'vendor_support'
          || authResponse.user.role === 'logistics'
          ? '/admin/dashboard'
          : '/';
    await router.push(safeRedirect ?? defaultDestination);
  } catch (err: any) {
    googleMessage.value = err.response?.data?.error
      || err.message
      || 'Google sign-in failed. Please try again.';
  } finally {
    loading.value = false;
  }
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
    const defaultDestination = authResponse.user.role === 'vendor'
      ? '/vendor'
      : authResponse.user.role === 'sales_agent'
        ? '/admin/sales'
        : authResponse.user.role === 'admin'
          || authResponse.user.role === 'staff'
          || authResponse.user.role === 'vendor_support'
          || authResponse.user.role === 'logistics'
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