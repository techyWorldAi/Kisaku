<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-700 to-blue-500 px-4 sm:px-6 py-4">
          <h1 class="text-xl sm:text-2xl font-bold text-white">My Orders</h1>
          <p class="text-blue-100 mt-1">Track, manage and view all your orders in one place.</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            class="inline-flex items-center bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors duration-200 font-semibold"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Start Shopping
          </router-link>
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-card"
          >
            <div class="order-card-content">
              <!-- Order Info -->
              <div class="order-info">
                <div class="flex flex-wrap items-center gap-3 mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">Order #{{ formatOrderNumber(order.id, order.order_number) }}</h3>
                  <span v-if="order.order_tag" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {{ order.order_tag.startsWith('CS-') ? 'Sales assisted' : order.order_tag }}
                  </span>
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

                <section :id="`order-tracking-${order.id}`" class="order-tracking" :aria-label="`Tracking progress for order ${formatOrderNumber(order.id, order.order_number)}`">
                  <p v-if="order.status === 'cancelled'" class="order-cancelled-message">
                    This order was cancelled.
                  </p>
                  <ol v-else class="order-progress">
                    <li
                      v-for="(step, index) in trackingSteps"
                      :key="step.key"
                      class="order-progress-step"
                      :class="{
                        complete: index <= getTrackingStage(order.status),
                        current: index === getTrackingStage(order.status),
                      }"
                    >
                      <span class="order-progress-marker" aria-hidden="true">
                        <Check v-if="index < getTrackingStage(order.status)" :size="12" />
                      </span>
                      <span class="order-progress-label">{{ step.label }}</span>
                    </li>
                  </ol>
                </section>

                <!-- Order Items Preview -->
                <div class="mt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="item in order.order_items || []" 
                      :key="item.id"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {{ item.product?.name || 'Order item' }} (x{{ item.quantity }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap gap-3">
                <a
                  :href="`#order-tracking-${order.id}`"
                  class="flex items-center space-x-2 rounded-lg px-4 py-2 font-medium text-yellow-700 hover:bg-yellow-50"
                >
                  <span>Track order</span>
                </a>
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
            <div class="bg-gradient-to-r from-blue-700 to-blue-500 px-4 sm:px-6 py-4 rounded-t-2xl flex justify-between items-center gap-3">
              <h3 class="text-base sm:text-lg font-semibold text-white break-words">Order Details - #{{ formatOrderNumber(selectedOrder.id, selectedOrder.order_number) }}</h3>
              <button @click="selectedOrder = null" class="text-white hover:text-yellow-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Order Details -->
            <div class="p-4 sm:p-6 space-y-6">
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
import { Check } from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';
import { orderAPI } from '../services/api';
import type { Order } from '../services/api';
import Header from '../components/layout/Menu.vue';
import { formatOrderNumber } from '../utils/orderNumber';

const authStore = useAuthStore();
const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(false);
const selectedOrder = ref<Order | null>(null);
const trackingSteps = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const;

function getTrackingStage(status: Order['status']) {
  switch (status) {
    case 'confirmed':
      return 1;
    case 'shipped':
      return 2;
    case 'delivered':
      return 3;
    case 'pending':
    case 'cancelled':
    default:
      return 0;
  }
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

<style scoped>
.orders-list {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: #f7f9fc;
}

.order-card {
  padding: 16px;
  border: 1px solid #e1e8f0;
  border-radius: 12px;
  background: #fff;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.order-card:hover {
  border-color: #b7d0eb;
  box-shadow: 0 4px 14px rgb(21 93 165 / 7%);
}

.order-card-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.order-info {
  min-width: 0;
  flex: 1;
}

.order-tracking {
  max-width: 540px;
  margin-top: 20px;
  scroll-margin-top: 100px;
}

.order-progress {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-progress-step {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  color: #64748b;
  text-align: center;
}

.order-progress-step:not(:last-child)::after {
  position: absolute;
  z-index: 0;
  top: 11px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #dce4ec;
  content: '';
}

.order-progress-step.complete:not(:last-child)::after {
  background: #2878bd;
}

.order-progress-marker {
  z-index: 1;
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border: 2px solid #d5dee8;
  border-radius: 50%;
  background: #fff;
  color: #fff;
}

.order-progress-step.complete .order-progress-marker {
  border-color: #2878bd;
  background: #2878bd;
}

.order-progress-step.current .order-progress-marker {
  box-shadow: 0 0 0 4px rgb(40 120 189 / 14%);
}

.order-progress-label {
  font-size: 0.72rem;
  line-height: 1.2;
}

.order-progress-step.complete .order-progress-label {
  color: #155da5;
  font-weight: 650;
}

.order-cancelled-message {
  margin: 0;
  color: #a22d2d;
  font-size: 0.88rem;
  font-weight: 650;
}

.order-card :deep(a[href^="#order-tracking-"]) {
  color: #155da5;
  text-decoration: none;
}

.order-card :deep(a[href^="#order-tracking-"]:hover) {
  background: #eff6fd;
}

@media (max-width: 640px) {
  .orders-list {
    gap: 10px;
    padding: 10px;
  }

  .order-card {
    padding: 13px;
  }

  .order-card-content {
    flex-direction: column;
    gap: 12px;
  }

  .order-tracking {
    margin-top: 16px;
  }

  .order-progress-label {
    font-size: 0.65rem;
  }
}
</style>