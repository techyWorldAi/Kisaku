<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50/30">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <router-link 
            to="/" 
            class="flex items-center space-x-3 group"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-black text-sm">T</span>
            </div>
            <span class="text-xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors">
              Shop
            </span>
          </router-link>
          
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">Welcome back,</span>
            <span class="font-semibold text-gray-900">{{ authStore.user?.name }}</span>
            <button 
              @click="handleLogout"
              class="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sticky top-24">
            <!-- User Avatar -->
            <div class="text-center mb-6">
              <div class="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ authStore.user?.name }}</h2>
              <p class="text-gray-600">{{ authStore.user?.email }}</p>
              <div class="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mt-2 capitalize">
                {{ authStore.user?.role }}
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="space-y-4 border-t border-gray-200 pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Member since</span>
                <span class="font-semibold text-gray-900">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Status</span>
                <span class="inline-flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Orders</span>
                <span class="font-semibold text-gray-900">{{ userStats.totalOrders }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Profile Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h3 class="text-lg font-semibold text-white">Profile Information</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="text-gray-900">{{ authStore.user?.name }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-gray-900">{{ authStore.user?.email }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span class="text-gray-900 capitalize">{{ authStore.user?.role }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-gray-900">{{ formatDate(authStore.user?.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <router-link 
              to="/shop" 
              class="group bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg hover:border-yellow-300 transition-all duration-300"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                    Browse Products
                  </h3>
                  <p class="text-gray-600">Discover our premium collection</p>
                </div>
              </div>
            </router-link>

            <router-link 
              to="/orders" 
              class="group bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg hover:border-yellow-300 transition-all duration-300"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                    My Orders
                  </h3>
                  <p class="text-gray-600">Track your purchases ({{ userStats.totalOrders }})</p>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Recent Orders Preview -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <router-link 
                to="/orders" 
                class="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
              >
                View all
              </router-link>
            </div>

            <div v-if="recentOrders.length > 0" class="space-y-4">
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-4 mb-2">
                    <h4 class="font-semibold text-gray-900">Order #{{ order.id }}</h4>
                    <span :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusClasses(order.status)
                    ]">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span class="font-medium">Date:</span>
                      <p>{{ formatDate(order.created_at) }}</p>
                    </div>
                    <div>
                      <span class="font-medium">Total:</span>
                      <p class="text-gray-900 font-semibold">Ksh {{ order.total.toLocaleString() }}</p>
                    </div>
                    <div>
                      <span class="font-medium">Payment:</span>
                      <p>{{ order.mpesa_receipt ? 'M-Pesa' : 'Cash' }}</p>
                    </div>
                  </div>
                </div>
                <router-link 
                  :to="`/orders`"
                  class="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>View</span>
                </router-link>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p>No orders yet</p>
              <router-link 
                to="/shop" 
                class="text-yellow-600 hover:text-yellow-700 font-medium mt-2 inline-block"
              >
                Start shopping →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { orderAPI } from '../services/api';
import type { Order } from '../services/api';

const authStore = useAuthStore();
const router = useRouter();

const userOrders = ref<Order[]>([]);
const loading = ref(false);

const userStats = computed(() => {
  return {
    totalOrders: userOrders.value.length,
    totalSpent: userOrders.value.reduce((total, order) => total + order.total, 0),
    pendingOrders: userOrders.value.filter(order => order.status === 'pending').length,
  };
});

const recentOrders = computed(() => {
  return userOrders.value.slice(0, 3); // Show only 3 most recent orders
});

function getStatusClasses(status: string) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

async function fetchUserOrders() {
  loading.value = true;
  try {
    const data = await orderAPI.getUserOrders();
    userOrders.value = data;
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (authStore.isAdmin) {
    router.push('/admin/dashboard');
    return;
  }

  await fetchUserOrders();
});
</script>