<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sticky top-24">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
    
    <!-- Cart Items -->
    <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
      <div 
        v-for="item in props.cartItems" 
        :key="item.id"
        class="flex items-center space-x-3"
      >
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            v-if="item.image" 
            :src="item.image" 
            :alt="item.name"
            class="w-full h-full object-contain p-1"
          />
          <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
          <p class="text-sm text-gray-600">Qty: {{ item.quantity }} × Ksh {{ item.price.toLocaleString() }}</p>
        </div>
        <div class="text-sm font-semibold text-gray-900">
          Ksh {{ (item.price * item.quantity).toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Price Breakdown -->
   

    <!-- Delivery Info -->
    <div v-if="props.currentStep > 1" class="mt-6 p-4 bg-blue-50 rounded-xl">
      <h4 class="font-semibold text-blue-900 text-sm mb-2">Delivery Information</h4>
      <p class="flex items-center gap-2 text-blue-700 text-sm" v-if="props.deliveryFee === 0">
        <Store :size="16" aria-hidden="true" />
        Store pickup
      </p>
      <p class="flex items-center gap-2 text-blue-700 text-sm" v-else>
        <Truck :size="16" aria-hidden="true" />
        Home delivery - KES {{ props.deliveryFee.toLocaleString() }}
      </p>
    </div>

    <!-- Items Count -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <p class="text-sm text-gray-600 text-center">
        {{ props.cartItems.length }} item{{ props.cartItems.length !== 1 ? 's' : '' }} in cart
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Store, Truck } from 'lucide-vue-next';
import type { CartItem } from '../../types/checkout';

interface Props {
  cartItems: CartItem[];
  cartTotal: number;
  deliveryFee: number;
  totalAmount: number;
  currentStep: number;
}

const props = defineProps<Props>();
</script>