<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Checkout Form -->
        <div class="lg:flex-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div class="bg-[#155DA5] px-6 py-4">
              <h1 class="text-2xl font-bold text-white">Checkout</h1>
              <p class="text-blue-100 mt-1">
                Complete your order
              </p>
            </div>

            <!-- Checkout Steps -->
            <div class="border-b border-gray-200">
              <div class="px-6 py-4">
                <div class="flex items-center justify-between max-w-md">
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      currentStep >= 1 ? 'bg-[#155DA5] text-white' : 'bg-gray-200 text-gray-600'
                    ]">
                      1
                    </div>
                    <span :class="[
                      'text-sm font-medium',
                      currentStep >= 1 ? 'text-[#155DA5]' : 'text-gray-500'
                    ]">Address</span>
                  </div>
                  <div class="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      currentStep >= 2 ? 'bg-[#155DA5] text-white' : 'bg-gray-200 text-gray-600'
                    ]">
                      2
                    </div>
                    <span :class="[
                      'text-sm font-medium',
                      currentStep >= 2 ? 'text-[#155DA5]' : 'text-gray-500'
                    ]">Payment</span>
                  </div>
                  <div class="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      currentStep >= 3 ? 'bg-[#155DA5] text-white' : 'bg-gray-200 text-gray-600'
                    ]">
                      3
                    </div>
                    <span :class="[
                      'text-sm font-medium',
                      currentStep >= 3 ? 'text-[#155DA5]' : 'text-gray-500'
                    ]">Confirm</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 1: Address Information -->
            <div v-if="currentStep === 1" class="p-6">
              <AddressForm
                :cart-total="cartStore.cartTotal"
                @next="handleAddressSubmit"
                @back="$router.push('/cart')"
              />
            </div>

            <!-- Step 2: Payment Method -->
            <div v-if="currentStep === 2 && addressData" class="p-6">
              <PaymentForm
                :address="addressData"
                :cart-items="cartStore.cartItems"
                :cart-total="cartStore.cartTotal"
                :delivery-fee="deliveryFee"
                :total-amount="totalAmount"
                @payment-success="handlePaymentSuccess"
                @payment-failed="handlePaymentFailed"
                @back="currentStep = 1"
              />
            </div>

            <!-- Step 3: Order Confirmation -->
            <div v-if="currentStep === 3" class="p-6">
              <OrderConfirmation
                :order="currentOrder"
                @continue-shopping="$router.push('/shop')"
                @view-orders="$router.push('/orders')"
              />
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:w-96">
          <OrderSummary
            :cart-items="cartStore.cartItems"
            :cart-total="cartStore.cartTotal"
            :delivery-fee="deliveryFee"
            :total-amount="totalAmount"
            :current-step="currentStep"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../store/cart';
import { useOrdersStore } from '../store/orders';
import type { Address } from '../types/checkout';
import type { Order } from '../services/api';
import Header from '../components/layout/Menu.vue';
import AddressForm from '../components/Checkout/AddressForm.vue';
import PaymentForm from '../components/Checkout/PaymentForm.vue';
import OrderConfirmation from '../components/Checkout/OrderConfirmation.vue';
import OrderSummary from '../components/Checkout/OrderSummary.vue';

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

const totalAmount = computed(() => {
  return cartStore.cartTotal + deliveryFee.value;
});

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
  // Optionally go back to payment step
  currentStep.value = 2;
}

onMounted(() => {
  if (cartStore.cartItemsCount === 0) {
    router.push('/cart');
  }
});
</script>