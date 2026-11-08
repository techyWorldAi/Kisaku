<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-gray-900">Payment Method</h2>
    
    <!-- Order Summary Preview -->
    <div class="bg-gray-50 rounded-xl p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      <div class="space-y-3">
        <!-- Cart Items -->
        <div v-for="item in props.cartItems" :key="item.id" class="flex justify-between items-center text-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                v-if="item.image" 
                :src="item.image" 
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ item.name }}</p>
              <p class="text-gray-600">Qty: {{ item.quantity }}</p>
            </div>
          </div>
          <span class="font-semibold text-gray-900">Ksh {{ (item.price * item.quantity).toLocaleString() }}</span>
        </div>
        
        <!-- Price Breakdown -->
        <div class="border-t border-gray-200 pt-3 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal</span>
            <span class="text-gray-900">Ksh {{ props.cartTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Delivery Fee</span>
            <span class="text-gray-900" v-if="props.deliveryFee === 0">Free</span>
            <span class="text-gray-900" v-else>Ksh {{ props.deliveryFee.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold mt-2 pt-2 border-t border-gray-200">
            <span class="text-gray-900">Total</span>
            <span class="text-gray-900">Ksh {{ props.totalAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Methods -->
    <div class="space-y-4 mb-8">
      <label 
        v-for="method in paymentMethods" 
        :key="method.value"
        class="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedPayment === method.value 
            ? 'border-[#155DA5] bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          v-model="selectedPayment"
          :value="method.value"
          class="accent-[#155DA5]"
          @change="handlePaymentChange"
        />
        <div class="flex items-center space-x-3">
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', method.bgColor]">
            <component :is="method.icon" class="w-6 h-6 text-white" />
          </div>
          <div>
            <span class="font-medium text-gray-900">{{ method.name }}</span>
            <p class="text-sm text-gray-600">{{ method.description }}</p>
          </div>
        </div>
      </label>
    </div>

    <div
      v-if="mpesaDialogOpen"
      class="mpesa-dialog-backdrop"
      @click.self="closeMpesaDialog"
      @keydown.esc="closeMpesaDialog"
    >
      <section
        class="mpesa-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mpesa-dialog-title"
        aria-describedby="mpesa-dialog-guidance"
      >
        <button
          class="mpesa-dialog-close"
          type="button"
          aria-label="Close M-Pesa payment dialog"
          :disabled="processingPayment"
          @click="closeMpesaDialog"
        >
          <X :size="20" />
        </button>

        <div class="mpesa-dialog-icon">
          <Smartphone :size="25" aria-hidden="true" />
        </div>
        <h3 id="mpesa-dialog-title">Pay with M-Pesa</h3>
        <p id="mpesa-dialog-guidance" class="mpesa-dialog-guidance">
          Enter the M-Pesa number to receive a payment prompt for
          <strong>Ksh {{ props.totalAmount.toLocaleString() }}</strong>.
          Keep your phone nearby. When the prompt arrives, check the amount and enter your M-Pesa PIN to approve.
        </p>

        <form class="mpesa-dialog-form" @submit.prevent="processPayment">
          <label for="mpesa-phone">M-Pesa phone number</label>
          <input
            id="mpesa-phone"
            ref="mpesaPhoneInput"
            v-model="mpesaPhone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="07XX XXX XXX or 2547XX XXX XXX"
            :aria-invalid="Boolean(mpesaErrors.phone)"
            :aria-describedby="mpesaErrors.phone ? 'mpesa-phone-error' : 'mpesa-phone-help'"
            :class="{ 'has-error': mpesaErrors.phone }"
            :disabled="processingPayment"
            @input="clearMpesaPhoneError"
          />
          <p v-if="mpesaErrors.phone" id="mpesa-phone-error" class="mpesa-phone-error">
            {{ mpesaErrors.phone }}
          </p>
          <p v-else id="mpesa-phone-help" class="mpesa-phone-help">
            Use the number registered with M-Pesa. You can enter it as 07…, 01…, or 254….
          </p>

          <p v-if="processingPayment" class="mpesa-waiting-message" role="status" aria-live="polite">
            <svg class="mpesa-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".2" stroke-width="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-linecap="round" stroke-width="3" />
            </svg>
            Sending your request. Keep this page open and watch your phone for the M-Pesa prompt.
          </p>

          <button class="mpesa-submit" type="submit" :disabled="processingPayment">
            {{ processingPayment ? 'Waiting for prompt…' : `Send prompt · Ksh ${props.totalAmount.toLocaleString()}` }}
          </button>
        </form>
      </section>
    </div>

    <!-- Cash on Delivery Info -->
    <div v-if="selectedPayment === 'cash'" class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h4 class="font-semibold text-blue-900">Cash on Delivery</h4>
          <p class="text-blue-700 text-sm mt-1">
            {{ props.address.deliveryMethod === 'pickup' 
              ? 'Pay when you collect your order from our store.' 
              : 'Pay with cash when your order is delivered.' 
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex justify-between space-x-4 pt-6">
      <button
        @click="$emit('back')"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
      >
        Back
      </button>
      <button
        @click="handlePayClick"
        :disabled="processingPayment || !selectedPayment"
        class="px-6 py-3 bg-[#FF8500] text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
      >
        <svg v-if="processingPayment" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <span>
          {{ processingPayment ? 'Processing...' :
             selectedPayment === 'cash' ? `Place Order (Ksh ${props.totalAmount.toLocaleString()})` :
             `Pay Ksh ${props.totalAmount.toLocaleString()}`
          }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { Banknote, Smartphone, X } from 'lucide-vue-next';
import { PaymentService } from '../../services/payment';
import { orderAPI } from '../../services/api';
import type { Order } from '../../services/api';
import { isDemoMode } from '../../services/demoStore';
import { useCartStore } from '../../store/cart';
import type { Address, CartItem } from '../../types/checkout';

// Icons for payment methods
const CashIcon = Banknote;

const MpesaIcon = Smartphone;

interface Props {
  address: Address;
  cartItems: CartItem[];
  cartTotal: number;
  deliveryFee: number;
  totalAmount: number;
}

interface Emits {
  (e: 'payment-success', order: Order & { payment_method?: string; delivery_method?: string }): void;
  (e: 'payment-failed', error: string): void;
  (e: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const cartStore = useCartStore();

const selectedPayment = ref<'mpesa' | 'cash' | ''>('');
const mpesaPhone = ref('');
const mpesaPhoneInput = ref<HTMLInputElement | null>(null);
const mpesaDialogOpen = ref(false);
const processingPayment = ref(false);
const mpesaErrors = ref<{ phone?: string }>({});

const paymentMethods = [
  {
    value: 'mpesa',
    name: 'M-Pesa',
    description: 'Pay instantly with M-Pesa',
    icon: MpesaIcon,
    bgColor: 'bg-green-600'
  },
  {
    value: 'cash',
    name: 'Cash on Delivery',
    description: props.address.deliveryMethod === 'pickup' ? 'Pay at store pickup' : 'Pay when delivered',
    icon: CashIcon,
    bgColor: 'bg-orange-600'
  }
];

function handlePaymentChange() {
  mpesaErrors.value = {};
  mpesaDialogOpen.value = selectedPayment.value === 'mpesa';
  if (mpesaDialogOpen.value) {
    void nextTick(() => mpesaPhoneInput.value?.focus());
  }
}

function handlePayClick() {
  if (selectedPayment.value === 'mpesa') {
    mpesaDialogOpen.value = true;
    void nextTick(() => mpesaPhoneInput.value?.focus());
    return;
  }

  void processPayment();
}

function closeMpesaDialog() {
  if (!processingPayment.value) mpesaDialogOpen.value = false;
}

function clearMpesaPhoneError() {
  if (mpesaErrors.value.phone) mpesaErrors.value = {};
}

async function processPayment() {
  if (!selectedPayment.value) {
    alert('Please select a payment method');
    return;
  }

  if (selectedPayment.value === 'mpesa') {
    // Validate M-Pesa phone
    const phoneError = PaymentService.validatePhone(mpesaPhone.value);
    if (phoneError) {
      mpesaErrors.value = { phone: phoneError };
      return;
    }
  }

  processingPayment.value = true;

  try {
    // Prepare order items for backend
    const orderItems = props.cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    // Create order data for backend - include payment method info
    const orderData = {
      items: orderItems,
      phone_number: selectedPayment.value === 'mpesa' ? mpesaPhone.value : props.address.phone,
      payment_method: selectedPayment.value,
      delivery_method: props.address.deliveryMethod,
      total: props.totalAmount,
    };

    const order = await orderAPI.createOrder(orderData);

    if (isDemoMode() && selectedPayment.value === 'mpesa') {
      await orderAPI.updateOrderStatus(order.id, { status: 'confirmed' });
      cartStore.clearCart();
      emit('payment-success', {
        ...order,
        status: 'confirmed',
        payment_method: 'mpesa',
        mpesa_receipt: 'DEMO-PAYMENT',
      });
      return;
    }

    // Process payment based on method
    if (selectedPayment.value === 'mpesa') {
      // Process M-Pesa payment
      const paymentResult = await PaymentService.processMpesaPayment(mpesaPhone.value, props.totalAmount);
      
      if (paymentResult.success) {
        // Update order with M-Pesa receipt if available
        if (paymentResult.data?.CheckoutRequestID) {
          // Here you would typically update the order with the M-Pesa receipt
          // For now, we'll just mark it as M-Pesa payment
        }
        
        // Clear cart and emit success with payment method info
        cartStore.clearCart();
        emit('payment-success', { 
          ...order, 
          payment_method: 'mpesa',
          mpesa_receipt: paymentResult.data?.CheckoutRequestID || 'Pending'
        });
      } else {
        // Payment failed - you might want to update order status to failed
        emit('payment-failed', paymentResult.message);
      }
    } else {
      // For cash payments, just clear cart and emit success with payment method info
      cartStore.clearCart();
      emit('payment-success', { 
        ...order, 
        payment_method: 'cash' 
      });
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    emit('payment-failed', errorMessage);
  } finally {
    processingPayment.value = false;
  }
}
</script>

<style scoped>
.mpesa-dialog-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  align-items: center;
  justify-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgb(15 31 50 / 58%);
}

.mpesa-dialog {
  position: relative;
  width: min(440px, 100%);
  padding: 28px;
  border: 1px solid #dce5ef;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 24px 70px rgb(15 31 50 / 28%);
}

.mpesa-dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.mpesa-dialog-close:hover:not(:disabled) {
  background: #f1f5f9;
  color: #102a43;
}

.mpesa-dialog-close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.mpesa-dialog-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 12px;
  background: #e8f7ed;
  color: #16803c;
}

.mpesa-dialog h3 {
  margin: 16px 0 7px;
  color: #102a43;
  font-size: 1.3rem;
  font-weight: 750;
}

.mpesa-dialog-guidance {
  margin: 0;
  color: #52657b;
  font-size: 0.88rem;
  line-height: 1.55;
}

.mpesa-dialog-guidance strong {
  color: #102a43;
}

.mpesa-dialog-form {
  display: grid;
  gap: 8px;
  margin-top: 20px;
}

.mpesa-dialog-form label {
  color: #263b56;
  font-size: 0.83rem;
  font-weight: 700;
}

.mpesa-dialog-form input {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #cbd8e8;
  border-radius: 6px;
  background: #fff;
  color: #102a43;
  font: inherit;
}

.mpesa-dialog-form input:focus {
  border-color: #155da5;
  outline: 3px solid rgb(21 93 165 / 14%);
}

.mpesa-dialog-form input.has-error {
  border-color: #dc2626;
}

.mpesa-phone-help,
.mpesa-phone-error {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
}

.mpesa-phone-help {
  color: #64748b;
}

.mpesa-phone-error {
  color: #b91c1c;
}

.mpesa-waiting-message {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 5px 0 0;
  padding: 11px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  color: #174b81;
  font-size: 0.78rem;
  line-height: 1.45;
}

.mpesa-spinner {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  animation: mpesa-spin 900ms linear infinite;
}

.mpesa-submit {
  min-height: 46px;
  margin-top: 9px;
  padding: 10px 14px;
  border: 0;
  border-radius: 6px;
  background: #f58216;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 750;
  cursor: pointer;
}

.mpesa-submit:hover:not(:disabled) {
  background: #df700d;
}

.mpesa-submit:disabled {
  cursor: wait;
  opacity: 0.7;
}

@keyframes mpesa-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .mpesa-dialog-backdrop {
    padding: 14px;
  }

  .mpesa-dialog {
    padding: 23px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mpesa-spinner {
    animation-duration: 2.5s;
  }
}
</style>