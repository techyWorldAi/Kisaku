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

          <div class="auth-provider-divider"><span>or sign up with</span></div>
          <button type="button" class="auth-google-button" @click="showGoogleUnavailable">
            <svg class="auth-google-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11c-.5 2.7-2 5-4.4 6.5v5.4h7.1c4.2-3.9 6.6-9.6 6.6-15.9z" />
              <path fill="#34A853" d="M24 44c5.9 0 10.9-2 14.5-5.5l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-8.9H4.4v5.6C8 36.8 15.3 44 24 44z" />
              <path fill="#FBBC05" d="M11.8 26.3c-.4-1.3-.6-2.7-.6-4.2s.2-2.9.6-4.2v-5.6H4.4C2.9 15.2 2 19.2 2 22.1s.9 6.9 2.4 9.8l7.4-5.6z" />
              <path fill="#EA4335" d="M24 8.9c3.2 0 6.1 1.1 8.3 3.2l6.2-6.2C34.7 2.3 29.8 0 24 0 15.3 0 8 4.8 4.4 12.3l7.4 5.6C13.5 12.8 18.3 8.9 24 8.9z" />
            </svg>
            Sign up with Google
          </button>
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
const googleMessage = ref('');

const authStore = useAuthStore();
const router = useRouter();

function showGoogleUnavailable() {
  googleMessage.value = 'Google sign-up is not set up yet. Please create your account with the form above.';
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