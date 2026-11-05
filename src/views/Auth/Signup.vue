<template>
  <main class="auth-page">
    <div class="auth-layout">
      <aside class="auth-brand-panel">
        <router-link to="/" class="auth-brand" aria-label="Kisaku Supply Agencies home">
          <span class="auth-brand-mark">K</span>
          <span class="auth-brand-copy">
            <strong>KISAKU</strong>
            <small>SUPPLY AGENCIES</small>
          </span>
        </router-link>
        <div class="auth-brand-message">
          <h1>Make everyday shopping easier.</h1>
          <p>Create an account to keep your orders and account details together.</p>
        </div>
        <span class="auth-brand-foot">Everyday products. Great prices. Delivered to you.</span>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import type { SignupRequest } from '../../services/api';

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref('');
const success = ref('');

const authStore = useAuthStore();
const router = useRouter();

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