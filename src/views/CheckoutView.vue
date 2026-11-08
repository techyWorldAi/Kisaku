<template>
  <div class="checkout-page">
    <Header />

    <main class="checkout-main">
      <nav class="checkout-steps" aria-label="Checkout progress">
        <div
          v-for="(step, index) in steps"
          :key="step.label"
          class="checkout-step"
          :class="{ 'is-active': currentStep >= index + 1 }"
          :aria-current="currentStep === index + 1 ? 'step' : undefined"
        >
          <span class="step-marker">{{ index + 1 }}</span>
          <span class="step-copy">
            <span class="step-title">{{ step.label }}</span>
            <span class="step-caption">{{ step.caption }}</span>
          </span>
          <span v-if="index < steps.length - 1" class="step-connector" aria-hidden="true"></span>
        </div>
      </nav>

      <div class="checkout-layout">
        <section class="checkout-form-panel">
          <AddressForm
            v-if="currentStep === 1"
            :cart-total="cartStore.cartTotal"
            @next="handleAddressSubmit"
            @back="$router.push('/cart')"
          />

          <PaymentForm
            v-else-if="currentStep === 2 && addressData"
            :address="addressData"
            :cart-items="cartStore.cartItems"
            :cart-total="cartStore.cartTotal"
            :delivery-fee="deliveryFee"
            :total-amount="totalAmount"
            @payment-success="handlePaymentSuccess"
            @payment-failed="handlePaymentFailed"
            @back="currentStep = 1"
          />

          <OrderConfirmation
            v-else-if="currentStep === 3"
            :order="currentOrder"
            @continue-shopping="$router.push('/shop')"
            @view-orders="$router.push('/orders')"
          />
        </section>

        <aside class="checkout-sidebar" aria-label="Order details">
          <OrderSummary
            :cart-items="cartStore.cartItems"
            :cart-total="cartStore.cartTotal"
            :delivery-fee="deliveryFee"
            :total-amount="totalAmount"
            :current-step="currentStep"
          />
          <router-link class="checkout-promo" to="/shop">
            <ShoppingBag :size="30" aria-hidden="true" />
            <span>
              <strong>Shop smart. Save more.</strong>
              <small>Discover great deals at Kisaku.</small>
            </span>
            <ArrowUpRight :size="18" aria-hidden="true" />
          </router-link>
        </aside>
      </div>

      <ul class="checkout-benefits" aria-label="Shopping benefits">
        <li>
          <Truck :size="23" aria-hidden="true" />
          <span><strong>Nationwide delivery</strong><small>Across Kenya</small></span>
        </li>
        <li>
          <ShieldCheck :size="23" aria-hidden="true" />
          <span><strong>Quality assured</strong><small>Trusted products</small></span>
        </li>
        <li>
          <CreditCard :size="23" aria-hidden="true" />
          <span><strong>Secure payments</strong><small>M-Pesa and more</small></span>
        </li>
        <li>
          <RefreshCw :size="23" aria-hidden="true" />
          <span><strong>Easy returns</strong><small>Hassle-free support</small></span>
        </li>
        <li>
          <Headphones :size="23" aria-hidden="true" />
          <span><strong>Customer support</strong><small>Here to help</small></span>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowUpRight,
  CreditCard,
  Headphones,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-vue-next';
import { useCartStore } from '../store/cart';
import { useOrdersStore } from '../store/orders';
import type { Address } from '../types/checkout';
import type { Order } from '../services/api';
import Header from '../components/layout/Menu.vue';
import AddressForm from '../components/Checkout/AddressForm.vue';
import PaymentForm from '../components/Checkout/PaymentForm.vue';
import OrderConfirmation from '../components/Checkout/OrderConfirmation.vue';
import OrderSummary from '../components/Checkout/OrderSummary.vue';

const steps = [
  { label: 'Delivery', caption: 'Your information' },
  { label: 'Payment', caption: 'Choose a method' },
  { label: 'Review & pay', caption: 'Confirm your order' },
];

const router = useRouter();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();

const currentStep = ref(1);
const addressData = ref<Address | null>(null);
const currentOrder = ref<Order | null>(null);

const deliveryFee = computed(() => {
  if (!addressData.value) return 0;
  return ordersStore.calculateDeliveryFee(cartStore.cartTotal, addressData.value.deliveryMethod);
});

const totalAmount = computed(() => cartStore.cartTotal + deliveryFee.value);

function handleAddressSubmit(address: Address) {
  addressData.value = address;
  currentStep.value = 2;
}

function handlePaymentSuccess(order: Order) {
  currentOrder.value = order;
  currentStep.value = 3;
}

function handlePaymentFailed(error: string) {
  alert(`Payment failed: ${error}`);
  currentStep.value = 2;
}

onMounted(() => {
  if (cartStore.cartItemsCount === 0) {
    router.push('/cart');
  }
});
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #102a43;
}

.checkout-main {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: 18px 0 14px;
}

.checkout-steps {
  display: flex;
  width: min(560px, 100%);
  align-items: flex-start;
  margin: 0 auto 18px;
}

.checkout-step {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: flex-start;
  gap: 9px;
  color: #8492a6;
}

.step-marker {
  z-index: 1;
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: 50%;
  background: #cbd5e1;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 750;
}

.is-active .step-marker {
  background: #075397;
}

.step-copy {
  display: grid;
  gap: 2px;
  padding-top: 1px;
}

.step-title {
  color: #68778b;
  font-size: 0.8rem;
  font-weight: 700;
}

.is-active .step-title {
  color: #075397;
}

.step-caption {
  font-size: 0.68rem;
}

.step-connector {
  position: absolute;
  top: 14px;
  left: 44px;
  width: calc(100% - 54px);
  height: 2px;
  background: #dce4ed;
  transform: translateX(50%);
}

.checkout-step.is-active .step-connector {
  background: #8db4dc;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(290px, 0.95fr);
  align-items: start;
  gap: 16px;
}

.checkout-form-panel,
.checkout-sidebar {
  min-width: 0;
}

.checkout-form-panel {
  padding: 18px;
  border: 1px solid #e1e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(16 42 67 / 4%);
}

.checkout-sidebar {
  display: grid;
  gap: 9px;
}

.checkout-promo {
  display: flex;
  min-height: 66px;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 8px;
  background: linear-gradient(110deg, #075397, #0b3970);
  color: #fff;
  text-decoration: none;
}

.checkout-promo > span {
  display: grid;
  flex: 1;
  gap: 3px;
}

.checkout-promo strong {
  font-size: 0.91rem;
}

.checkout-promo small {
  color: #e0edfa;
  font-size: 0.75rem;
}

.checkout-benefits {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 16px -8px 0;
  padding: 11px 8px;
  border-radius: 8px;
  background: #eaf2ff;
  list-style: none;
}

.checkout-benefits li {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #075397;
}

.checkout-benefits li + li {
  border-left: 1px solid #a9c5e8;
}

.checkout-benefits li span {
  display: grid;
  gap: 2px;
}

.checkout-benefits strong {
  font-size: 0.7rem;
  line-height: 1.25;
  text-transform: capitalize;
}

.checkout-benefits small {
  color: #415c7b;
  font-size: 0.63rem;
}

@media (max-width: 850px) {
  .checkout-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .checkout-sidebar {
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.7fr);
    align-items: start;
  }

  .checkout-benefits {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .checkout-main {
    width: calc(100% - 28px);
    padding-top: 16px;
  }

  .checkout-steps {
    margin-bottom: 14px;
  }

  .checkout-step {
    gap: 6px;
  }

  .step-marker {
    width: 27px;
    height: 27px;
    flex-basis: 27px;
  }

  .step-title {
    font-size: 0.7rem;
  }

  .step-caption {
    font-size: 0.6rem;
  }

  .step-connector {
    top: 13px;
    left: 34px;
    width: calc(100% - 40px);
  }

  .checkout-form-panel {
    padding: 16px 13px;
  }

  .checkout-sidebar {
    grid-template-columns: minmax(0, 1fr);
  }

  .checkout-benefits {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-right: 0;
    margin-left: 0;
  }

  .checkout-benefits li {
    justify-content: flex-start;
    padding: 7px;
  }

  .checkout-benefits li + li {
    border-left: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .checkout-promo {
    transition: filter 140ms ease;
  }

  .checkout-promo:hover {
    filter: brightness(1.1);
  }
}
</style>
