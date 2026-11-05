<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <h1 class="text-2xl font-bold text-white">My Orders</h1>
          <p class="text-yellow-100 mt-1">Track your order history and status</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p class="text-gray-600">Loading your orders...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="orders.length === 0" class="text-center py-16">
          <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p class="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <router-link 
            to="/shop" 
            class="inline-flex items-center bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Start Shopping
          </router-link>
        </div>

        <!-- Orders List -->
        <div v-else class="divide-y divide-gray-200">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <!-- Order Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-4 mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.id }}</h3>
                  <span :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    getStatusClasses(order.status)
                  ]">
                    {{ order.status }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">Order Date:</span>
                    <p>{{ formatDate(order.created_at) }}</p>
                  </div>
                  <div>
                    <span class="font-medium">Total Amount:</span>
                    <p class="text-gray-900 font-semibold">Ksh {{ order.total.toLocaleString() }}</p>
                  </div>
                  <div>
                    <span class="font-medium">Payment Method:</span>
                    <p>{{ order.mpesa_receipt ? 'M-Pesa' : 'Cash on Delivery' }}</p>
                  </div>
                </div>

                <!-- Order Items Preview -->
                <div class="mt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="item in order.order_items || []" 
                      :key="item.id"
                      class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {{ item.product?.name }} (x{{ item.quantity }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex space-x-3">
                <button 
                  @click="viewOrderDetails(order)"
                  class="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div v-if="selectedOrder" class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div class="relative min-h-full flex items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200/60">
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
              <!-- Order Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Order Date:</span>
                      <span class="font-medium text-gray-900">{{ formatDate(selectedOrder.created_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Status:</span>
                      <span :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusClasses(selectedOrder.status)
                      ]">
                        {{ selectedOrder.status }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Payment Method:</span>
                      <span class="font-medium text-gray-900 capitalize">
                        {{ selectedOrder.mpesa_receipt ? 'M-Pesa' : 'Cash on Delivery' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Payment Details</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Total Amount:</span>
                      <span class="font-medium text-gray-900">Ksh {{ selectedOrder.total.toLocaleString() }}</span>
                    </div>
                    <div v-if="selectedOrder.mpesa_receipt" class="flex justify-between">
                      <span class="text-gray-600">M-Pesa Receipt:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.mpesa_receipt }}</span>
                    </div>
                    <div v-if="selectedOrder.phone_number" class="flex justify-between">
                      <span class="text-gray-600">Phone Number:</span>
                      <span class="font-medium text-gray-900">{{ selectedOrder.phone_number }}</span>
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
                        <p class="text-sm text-gray-600">Ksh {{ item.price.toLocaleString() }} each</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900">Ksh {{ (item.price * item.quantity).toLocaleString() }}</p>
                    </div>
                  </div>
                </div>

                <!-- Order Total -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <div class="flex justify-between items-center text-lg font-semibold">
                    <span class="text-gray-900">Total:</span>
                    <span class="text-gray-900">Ksh {{ selectedOrder.total.toLocaleString() }}</span>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { orderAPI } from '../services/api';
import type { Order } from '../services/api';
import Header from '../components/layout/Menu.vue';

const authStore = useAuthStore();
const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(false);
const selectedOrder = ref<Order | null>(null);

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

function viewOrderDetails(order: Order) {
  selectedOrder.value = order;
}

async function fetchOrders() {
  loading.value = true;
  try {
    const data = await orderAPI.getUserOrders();
    orders.value = data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    alert('Failed to load your orders');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  await fetchOrders();
});
</script>