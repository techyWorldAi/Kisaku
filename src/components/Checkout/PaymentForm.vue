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

    <!-- M-Pesa Payment Form -->
    <div v-if="selectedPayment === 'mpesa'" class="bg-gray-50 p-6 rounded-xl mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">M-Pesa Payment</h3>
      <p class="text-gray-600 mb-4">
        You will receive a prompt on your phone to complete the payment of 
        <strong>Ksh {{ props.totalAmount.toLocaleString() }}</strong>.
      </p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            v-model="mpesaPhone"
            :class="[
              'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
              mpesaErrors.phone ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="07XX XXX XXX"
          />
          <p v-if="mpesaErrors.phone" class="mt-1 text-sm text-red-600">{{ mpesaErrors.phone }}</p>
        </div>
      </div>
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
        @click="processPayment"
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
import { ref } from 'vue';
import { Banknote, Smartphone } from 'lucide-vue-next';
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