<template>
  <div class="tracking-page min-h-screen bg-gray-50">
    <Header />

    <main class="tracking-main">
      <header class="tracking-page-heading">
        <router-link to="/orders" class="tracking-back-link">
          <ArrowLeft :size="17" aria-hidden="true" />
          My orders
        </router-link>
        <h1>Track your order</h1>
        <p>Follow your item from order placement to delivery.</p>
      </header>

      <div v-if="loading" class="tracking-message" role="status">
        <span class="tracking-spinner" aria-hidden="true" />
        Loading your order status...
      </div>

      <section v-else-if="loadError" class="tracking-message tracking-error" role="alert">
        <PackageX :size="34" aria-hidden="true" />
        <h2>We couldn’t load this order</h2>
        <p>{{ loadError }}</p>
        <button type="button" class="tracking-button" @click="loadOrder">Try again</button>
        <router-link to="/orders" class="tracking-text-link">Go to my orders</router-link>
      </section>

      <section v-else-if="!selectedOrder" class="tracking-message">
        <PackageX :size="34" aria-hidden="true" />
        <h2>No orders to track yet</h2>
        <p>Your orders and delivery updates will appear here.</p>
        <router-link to="/shop" class="tracking-button">Start shopping</router-link>
      </section>

      <template v-else>
        <section class="tracking-order-card" aria-label="Order tracking details">
          <div class="tracking-current-status">
            <div>
              <p class="tracking-eyebrow">Current status</p>
              <h2>{{ statusTitle }}</h2>
            </div>
            <span class="tracking-status-badge" :class="`status-${selectedOrder.status}`">
              {{ statusTitle }}
            </span>
          </div>

          <div v-if="selectedOrder.status === 'cancelled'" class="tracking-cancelled" role="status">
            This order was cancelled. Contact our support team if you need help.
          </div>

          <ol class="tracking-timeline">
            <li
              v-for="(step, index) in trackingSteps"
              :key="step.key"
              class="tracking-step"
              :class="{
                complete: selectedOrder.status !== 'cancelled' && index <= currentStage,
                current: selectedOrder.status !== 'cancelled' && index === currentStage,
              }"
            >
              <span class="tracking-step-marker">
                <Check v-if="selectedOrder.status !== 'cancelled' && index < currentStage" :size="17" aria-hidden="true" />
                <component v-else :is="step.icon" :size="17" aria-hidden="true" />
              </span>
              <span class="tracking-step-copy">
                <strong>{{ stepTitle(step.key) }}</strong>
                <span>{{ stepDescription(step.key) }}</span>
                <time v-if="step.key === 'placed'">{{ formatDate(selectedOrder.created_at) }}</time>
              </span>
            </li>
          </ol>

          <div class="tracking-order-divider" />

          <div class="tracking-item-card" aria-label="Tracked item">
            <div class="tracking-item-image">
              <img
                v-if="trackedItem?.product?.image"
                :src="trackedItem.product.image"
                :alt="trackedItem.product.name"
              />
              <ShoppingBag v-else :size="28" aria-hidden="true" />
            </div>
            <div class="tracking-item-details">
              <p class="tracking-order-number">Order #{{ formatOrderNumber(selectedOrder.id, selectedOrder.order_number) }}</p>
              <h2>{{ trackedItem?.product?.name || 'Order items' }}</h2>
              <p v-if="trackedItem">Quantity: {{ trackedItem.quantity }}</p>
              <p v-else>{{ selectedOrder.order_items?.length || 0 }} items in this order</p>
              <p class="tracking-order-date">Placed {{ formatDate(selectedOrder.created_at) }}</p>
            </div>
            <div class="tracking-total">
              <span>Order total</span>
              <strong>KSh {{ Number(selectedOrder.total).toLocaleString('en-KE') }}</strong>
            </div>
          </div>
        </section>

        <footer class="tracking-footer">
          <span>Order status updates automatically when your order changes.</span>
          <router-link to="/orders" class="tracking-text-link">View all orders</router-link>
        </footer>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  ArrowLeft,
  Check,
  Package,
  PackageX,
  ShoppingBag,
  ShoppingCart,
  ThumbsUp,
  Truck,
} from 'lucide-vue-next';
import { orderAPI } from '../services/api';
import type { Order, OrderItem } from '../services/api';
import Header from '../components/layout/Menu.vue';
import { formatOrderNumber } from '../utils/orderNumber';

const route = useRoute();
const selectedOrder = ref<Order | null>(null);
const trackedItem = ref<OrderItem | null>(null);
const loading = ref(true);
const loadError = ref('');
let requestId = 0;

const trackingSteps = [
  { key: 'placed', icon: ShoppingCart },
  { key: 'dispatched', icon: Package },
  { key: 'transit', icon: Truck },
  { key: 'delivered', icon: ThumbsUp },
] as const;

const currentStage = computed(() => {
  switch (selectedOrder.value?.status) {
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
});

const statusTitle = computed(() => {
  switch (selectedOrder.value?.status) {
    case 'confirmed':
      return 'Order confirmed';
    case 'shipped':
      return 'Order in transit';
    case 'delivered':
      return 'Delivered successfully';
    case 'cancelled':
      return 'Order cancelled';
    case 'pending':
    default:
      return 'Order placed';
  }
});

function queryId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

async function loadOrder() {
  const currentRequestId = ++requestId;
  loading.value = true;
  loadError.value = '';
  selectedOrder.value = null;
  trackedItem.value = null;

  const hasOrderQuery = route.query.order !== undefined;
  const orderId = queryId(route.query.order);
  const hasItemQuery = route.query.item !== undefined;
  const itemId = queryId(route.query.item);

  if (hasOrderQuery && orderId === null || hasItemQuery && itemId === null) {
    loadError.value = 'The order or item link is invalid. Open tracking from your order details and try again.';
    loading.value = false;
    return;
  }

  try {
    const orders = await orderAPI.getUserOrders();
    if (currentRequestId !== requestId) return;

    const order = orderId === null
      ? [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0]
      : orders.find((candidate) => candidate.id === orderId);

    if (!order) {
      loadError.value = 'We couldn’t find that order in your account.';
      return;
    }

    const item = itemId === null
      ? order.order_items?.[0] ?? null
      : order.order_items?.find((candidate) => candidate.id === itemId) ?? null;

    if (itemId !== null && !item) {
      loadError.value = 'We couldn’t find that item in this order.';
      return;
    }

    selectedOrder.value = order;
    trackedItem.value = item;
  } catch (error) {
    console.error('Failed to load order tracking information:', error);
    if (currentRequestId === requestId) {
      loadError.value = 'Please check your connection and try again.';
    }
  } finally {
    if (currentRequestId === requestId) loading.value = false;
  }
}

function stepTitle(key: typeof trackingSteps[number]['key']) {
  if (key === 'dispatched' && selectedOrder.value?.status === 'confirmed') return 'Order confirmed';
  if (key === 'dispatched') return 'Order dispatched';
  if (key === 'transit') return 'Order in transit';
  if (key === 'delivered') return 'Delivered successfully';
  return 'Order placed';
}

function stepDescription(key: typeof trackingSteps[number]['key']) {
  const status = selectedOrder.value?.status;
  if (key === 'placed') return 'We received your order.';
  if (key === 'dispatched') {
    if (status === 'confirmed') return 'Your order is confirmed and being prepared.';
    if (status === 'shipped' || status === 'delivered') return 'Your order has been dispatched.';
    return 'We’ll update you when your order is dispatched.';
  }
  if (key === 'transit') {
    if (status === 'shipped') return 'Your package is on its way.';
    if (status === 'delivered') return 'Your package has arrived.';
    return 'Tracking will update when your package is on its way.';
  }
  return status === 'delivered'
    ? 'Your item was delivered successfully.'
    : 'This step is waiting for your order to arrive.';
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date to be confirmed';
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(date);
}

watch(
  () => [route.query.order, route.query.item],
  () => void loadOrder(),
  { immediate: true },
);
</script>

<style scoped>
.tracking-page {
  color: #172b3e;
}

.tracking-main {
  width: min(760px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 56px;
}

.tracking-page-heading {
  margin-bottom: 20px;
}

.tracking-back-link,
.tracking-text-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #155da5;
  font-size: 0.88rem;
  font-weight: 650;
  text-decoration: none;
}

.tracking-page-heading h1 {
  margin: 18px 0 4px;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 750;
}

.tracking-page-heading p {
  margin: 0;
  color: #64748b;
}

.tracking-order-card,
.tracking-message {
  border: 1px solid #e6e9ed;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 20px rgb(16 42 67 / 5%);
}

.tracking-order-card {
  margin-top: 16px;
  padding: 22px;
}

.tracking-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tracking-item-image {
  display: grid;
  width: 76px;
  height: 76px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: #f1f3f5;
  color: #9aa5b1;
}

.tracking-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tracking-item-details {
  min-width: 0;
  flex: 1;
}

.tracking-item-details p,
.tracking-item-details h2 {
  margin: 0;
}

.tracking-order-number,
.tracking-item-details > p:not(.tracking-order-number) {
  color: #64748b;
  font-size: 0.82rem;
}

.tracking-item-details h2 {
  margin: 3px 0;
  font-size: 1rem;
  font-weight: 700;
}

.tracking-item-details .tracking-order-date {
  margin-top: 5px;
}

.tracking-total {
  display: grid;
  gap: 4px;
  text-align: right;
}

.tracking-total span {
  color: #64748b;
  font-size: 0.75rem;
}

.tracking-current-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf0f2;
}

.tracking-eyebrow {
  margin: 0 0 3px;
  color: #64748b;
  font-size: 0.8rem;
}

.tracking-current-status h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 750;
  text-transform: capitalize;
}

.tracking-order-divider {
  height: 1px;
  margin: 20px 0;
  background: #edf0f2;
}

.tracking-status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: #e7f1ff;
  color: #1d5e9f;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-confirmed {
  background: #e7f1ff;
  color: #1d5e9f;
}

.status-shipped {
  background: #eee9ff;
  color: #5b3e9b;
}

.status-delivered {
  background: #e3f7ea;
  color: #237342;
}

.status-cancelled {
  background: #ffebeb;
  color: #a22d2d;
}

.tracking-cancelled {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fff1f1;
  color: #942b2b;
  font-size: 0.9rem;
}

.tracking-timeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.tracking-step {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  text-align: center;
}

.tracking-step:not(:last-child)::after {
  position: absolute;
  top: 20px;
  right: calc(-50% + 21px);
  left: calc(50% + 21px);
  height: 2px;
  background: #e1e5e9;
  content: '';
}

.tracking-step.complete:not(:last-child)::after {
  background: #2878bd;
}

.tracking-step-marker {
  z-index: 1;
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #e1e5e9;
  border-radius: 50%;
  background: #fff;
  color: #98a2ad;
}

.tracking-step.complete .tracking-step-marker {
  border-color: #2878bd;
  background: #2878bd;
  color: #fff;
}

.tracking-step.current .tracking-step-marker {
  box-shadow: 0 0 0 5px rgb(40 120 189 / 16%);
}

.tracking-step-copy {
  display: grid;
  justify-items: center;
  gap: 3px;
  padding: 0 4px 12px;
}

.tracking-step-copy strong {
  color: #87919b;
  font-size: 0.98rem;
  font-weight: 650;
}

.tracking-step.complete .tracking-step-copy strong {
  color: #155da5;
}

.tracking-step-copy span,
.tracking-step-copy time {
  color: #77828d;
  font-size: 0.83rem;
}

.tracking-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 3px;
  color: #64748b;
  font-size: 0.8rem;
}

.tracking-message {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 44px 20px;
  color: #64748b;
  text-align: center;
}

.tracking-message h2,
.tracking-message p {
  margin: 0;
}

.tracking-message h2 {
  color: #172b3e;
  font-size: 1.2rem;
}

.tracking-error {
  color: #a22d2d;
}

.tracking-button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border: 0;
  border-radius: 7px;
  background: #155da5;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.tracking-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #d5e6f5;
  border-top-color: #155da5;
  border-radius: 50%;
  animation: tracking-spin 800ms linear infinite;
}

@keyframes tracking-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .tracking-timeline {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .tracking-step {
    align-items: flex-start;
    flex-direction: row;
    min-height: 82px;
    gap: 12px;
    text-align: left;
  }

  .tracking-step:not(:last-child)::after {
    top: 42px;
    right: auto;
    bottom: 0;
    left: 18px;
    width: 2px;
    height: auto;
  }

  .tracking-step-marker {
    width: 38px;
    height: 38px;
  }

  .tracking-step-copy {
    justify-items: start;
    padding: 2px 0 18px;
  }
}

@media (max-width: 560px) {
  .tracking-main {
    width: calc(100% - 24px);
    padding-top: 18px;
  }

  .tracking-item-card {
    gap: 10px;
    padding: 12px;
  }

  .tracking-item-image {
    width: 58px;
    height: 58px;
  }

  .tracking-item-details h2 {
    font-size: 0.88rem;
  }

  .tracking-total {
    display: none;
  }

  .tracking-order-card {
    padding: 16px;
  }

  .tracking-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
