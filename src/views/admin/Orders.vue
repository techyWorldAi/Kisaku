<template>
  <div class="admin-page-shell min-h-screen bg-gray-50">
    <AdminSidebar />
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <router-link 
              to="/admin/dashboard" 
              class="flex items-center space-x-3 group"
            >
              <img
                class="h-9 w-auto max-w-[180px] object-contain"
                src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
                alt="Kisaku Supply Agencies"
              />
            </router-link>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1 class="text-lg font-semibold text-gray-900">Order Management</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              to="/admin/dashboard" 
              class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Dashboard</span>
            </router-link>
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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Orders</h2>
          <p class="text-gray-600 mt-2">Manage customer orders and track order status</p>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Status Filter -->
          <div class="relative">
            <select 
              v-model="statusFilter"
              class="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200/60">
          <div class="admin-list-header grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
            <div class="col-span-2">Order ID</div>
            <div class="col-span-3">Customer</div>
            <div class="col-span-2">Total</div>
            <div class="col-span-2">Payment</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-1 text-right">Actions</div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="divide-y divide-gray-200/60">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id"
            class="admin-list-item px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200"
          >
            <div class="admin-list-row grid grid-cols-12 gap-4 items-center">
              <!-- Order ID -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Order</span>
                <span class="text-sm font-semibold text-gray-900">#{{ order.id }}</span>
                <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
              </div>

              <!-- Customer Info -->
              <div class="col-span-3">
                <span class="admin-mobile-label">Customer</span>
                <div v-if="order.user" class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {{ order.user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">{{ order.user.name }}</h3>
                    <p class="text-sm text-gray-500 truncate">{{ order.user.email }}</p>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-500">Unknown User</span>
              </div>

              <!-- Total -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Total</span>
                <span class="text-sm font-semibold text-gray-900">Ksh {{ order.total.toLocaleString() }}</span>
              </div>

              <!-- Payment Method -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Payment</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getPaymentMethodClasses(order.payment_method)">
                  {{ getPaymentMethodDisplay(order.payment_method) }}
                </span>
                <p v-if="order.mpesa_receipt" class="text-xs text-gray-500 mt-1 truncate">
                  {{ order.mpesa_receipt }}
                </p>
              </div>

              <!-- Status -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Status</span>
                <select 
                  v-model="order.status" 
                  @change="updateOrderStatus(order.id, order.status)"
                  :class="[
                    'text-xs font-medium py-1 px-2 rounded-full border-0 focus:ring-2 focus:ring-yellow-500',
                    getStatusClasses(order.status)
                  ]"
                >
                  <option value="pending" class="bg-yellow-100 text-yellow-800">Pending</option>
                  <option value="confirmed" class="bg-blue-100 text-blue-800">Confirmed</option>
                  <option value="shipped" class="bg-purple-100 text-purple-800">Shipped</option>
                  <option value="delivered" class="bg-green-100 text-green-800">Delivered</option>
                  <option value="cancelled" class="bg-red-100 text-red-800">Cancelled</option>
                </select>
              </div>

              <!-- Actions -->
              <div class="col-span-1 flex justify-end">
                <button 
                  @click="viewOrderDetails(order)"
                  class="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p class="text-gray-600">Loading orders...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && filteredOrders.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p class="text-gray-600">
            {{ statusFilter ? 'No orders match the selected status' : 'No orders have been placed yet' }}
          </p>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div v-if="selectedOrder" class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div class="relative min-h-full flex items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-gray-200/60">
            <!-- Header -->
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 class="text-lg font-semibold text-white">Order Details - #{{ selectedOrder.id }}</h3>
              <button @click="selectedOrder = null" class="text-white hover:text-yellow-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Order Details -->
            <div class="p-6 space-y-6">
              <!-- Customer Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Name:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.user?.name || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Email:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.user?.email || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Phone:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.phone_number || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Order Date:</span>
                      <span class="font-medium text-gray-900">{{ formatDate(selectedOrder.created_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Payment Method:</span>
                      <span class="font-medium text-gray-900 capitalize">
                        {{ getPaymentMethodDisplay(selectedOrder.payment_method) }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Total Amount:</span>
                      <span class="font-medium text-gray-900">Ksh {{ selectedOrder.total.toLocaleString() }}</span>
                    </div>
                    <div v-if="selectedOrder.mpesa_receipt" class="flex justify-between">
                      <span class="text-gray-600">M-Pesa Receipt:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.mpesa_receipt }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                <div class="space-y-4">
                  <div 
                    v-for="item in selectedOrder.order_items || []" 
                    :key="item.id"
                    class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                      </div>
                      <div>
                        <h5 class="font-semibold text-gray-900">{{ item.product?.name }}</h5>
                        <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900">Ksh {{ item.price.toLocaleString() }}</p>
                      <p class="text-sm text-gray-600">Ksh {{ (item.price * item.quantity).toLocaleString() }} total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { orderAPI } from '../../services/api';
import type { Order } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const orders = ref<Order[]>([]);
const loading = ref(false);
const statusFilter = ref('');
const selectedOrder = ref<Order | null>(null);

const filteredOrders = computed(() => {
  const userId = Number(route.query.user);
  return orders.value.filter(order =>
    (!Number.isInteger(userId) || order.user_id === userId)
      && (!statusFilter.value || order.status === statusFilter.value));
});

function getPaymentMethodDisplay(method: string | undefined) {
  if (method === 'mpesa') return 'M-Pesa';
  if (method === 'cash') return 'Cash on Delivery';
  return method || 'Cash';
}

function getPaymentMethodClasses(method: string | undefined) {
  if (method === 'mpesa') return 'bg-green-100 text-green-800';
  if (method === 'cash') return 'bg-gray-100 text-gray-800';
  return 'bg-gray-100 text-gray-800';
}

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function updateOrderStatus(orderId: number, status: Order['status']) {
  try {
    await orderAPI.updateOrderStatus(orderId, { status });
    // Refresh orders to get updated data
    await fetchOrders();
  } catch {
    console.error('Failed to update order status.');
    alert('Failed to update order status');
  }
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order;
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

async function fetchOrders() {
  loading.value = true;
  try {
    const data = await orderAPI.getOrders();
    orders.value = data;
  } catch {
    console.error('Failed to fetch admin orders.');
    alert('Failed to load orders');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // The API remains responsible for enforcing staff and admin permissions.
  if (!authStore.canAccessAdmin) {
    router.push('/profile');
    return;
  }

  await fetchOrders();
});
</script>

<style scoped>
.admin-page-shell > header > div {
  padding-left: 52px;
}

@media (min-width: 801px) {
  .admin-page-shell {
    padding-left: 246px;
  }

  .admin-page-shell > header > div {
    padding-left: 0;
  }
}
</style>