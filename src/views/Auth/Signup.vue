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
          <h1>Shop smart.<br />Live <span>better</span></h1>
          <p>Create an account for faster checkout, order updates and easier shopping.</p>
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
          <h2 class="auth-form-heading">Create your account</h2>
          <p class="auth-form-subtitle">Join Kisaku Supply Agencies and get started with your next order.</p>

          <div v-if="success" class="auth-message auth-message-success" role="status">
            {{ success }}
          </div>
          <div v-if="error" class="auth-message auth-message-error" role="alert">
            {{ error }}
          </div>

          <form class="auth-form" @submit.prevent="handleSignup">
            <div class="auth-field">
              <label for="name">Full name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="John Doe"
                :disabled="loading"
              />
            </div>

            <div class="auth-field">
              <label for="email">Email address</label>
              <input
                id="email"
                v-model="form.email"
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
                v-model="form.password"
                type="password"
                required
                placeholder="At least 6 characters"
                :disabled="loading"
              />
            </div>

            <div class="auth-field">
              <label for="confirm">Confirm password</label>
              <input
                id="confirm"
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="Enter your password again"
                :disabled="loading"
              />
            </div>

            <button type="submit" class="auth-submit" :disabled="loading">
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <div class="auth-provider-divider"><span>or sign up with</span></div>
          <div ref="googleButton" class="auth-google-button-container" aria-label="Sign up with Google"></div>
          <p v-if="googleMessage" class="auth-provider-message" role="status">{{ googleMessage }}</p>

          <p class="auth-form-footer">
            Already have an account?
            <router-link to="/login">Sign in</router-link>
          </p>
          <router-link to="/" class="auth-home-link">Continue browsing the store</router-link>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import type { SignupRequest } from '../../services/api';
import { loadGoogleIdentityServices } from '../../services/googleAuth';

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref('');
const success = ref('');
const googleMessage = ref('');
const googleButton = ref<HTMLElement | null>(null);

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    googleMessage.value = 'Google sign-up is not configured.';
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
      text: 'signup_with',
      shape: 'rectangular',
      width: 320,
    });
  } catch (err: unknown) {
    googleMessage.value = err instanceof Error ? err.message : 'Google sign-up could not be loaded.';
  }
});

async function handleGoogleCredential(response: { credential: string }) {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  success.value = '';
  googleMessage.value = '';

  try {
    await authStore.googleLogin({ credential: response.credential });
    success.value = 'Signed in with Google. Redirecting...';
    setTimeout(() => {
      if (authStore.canAccessAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    }, 800);
  } catch (err: any) {
    googleMessage.value = err.response?.data?.error
      || err.message
      || 'Google sign-up failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

async function handleSignup() {
  if (loading.value) return;

  // Reset messages
  error.value = '';
  success.value = '';

  // Validation
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters.';
    return;
  }

  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields.';
    return;
  }

  loading.value = true;

  try {
    const userData: SignupRequest = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    };

    // Call the auth store to register the user
    await authStore.signup(userData);

    success.value = 'Account created successfully. Redirecting...';

    // Wait a moment to show success message, then redirect
    setTimeout(() => {
      if (authStore.canAccessAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    }, 1500);

  } catch (err: any) {
    // User-friendly error messages
    if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
      error.value = 'Network error: Cannot connect to the server. Please try again.';
    } else if (err.code === 'ECONNABORTED') {
      error.value = 'Request timed out. Please try again.';
    } else if (err.response?.status === 400) {
      error.value = err.response?.data?.error || 'Invalid sign-up details. Please check your information.';
    } else if (err.response?.status === 409) {
      error.value = 'An account with this email already exists.';
    } else if (err.response?.status === 0) {
      error.value = 'Cannot connect to the server. Please try again.';
    } else {
      error.value = err.response?.data?.error || 'Sign-up failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-google-button-container { display: flex; justify-content: center; min-height: 44px; }
</style>