<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-gray-900">Delivery Information</h2>
    
    <form @submit.prevent="validateAndSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            @input="clearError('name')"
            :class="[
              'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
              errors.name ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter your full name"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            @input="clearError('email')"
            :class="[
              'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
              errors.email ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter your email"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          v-model="formData.phone"
          @input="clearError('phone')"
          :class="[
            'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
            errors.phone ? 'border-red-500' : 'border-gray-300'
          ]"
          placeholder="07XX XXX XXX or +254 XXX XXX"
        />
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
          Delivery Address *
        </label>
        <textarea
          id="address"
          v-model="formData.address"
          @input="clearError('address')"
          rows="3"
          :class="[
            'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
            errors.address ? 'border-red-500' : 'border-gray-300'
          ]"
          placeholder="Enter your complete delivery address"
        ></textarea>
        <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
            City/Town *
          </label>
          <input
            type="text"
            id="city"
            v-model="formData.city"
            @input="clearError('city')"
            :class="[
              'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155DA5] focus:border-[#155DA5] transition-colors',
              errors.city ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter your city"
          />
          <p v-if="errors.city" class="mt-1 text-sm text-red-600">{{ errors.city }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Delivery Method
          </label>
          <div class="space-y-3">
            <label class="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                v-model="formData.deliveryMethod"
                value="pickup"
                class="accent-[#155DA5]"
              />
              <div>
                <span class="font-medium text-gray-900">Shop Pickup</span>
                <p class="text-sm text-gray-600">Free - Collect from our store</p>
              </div>
            </label>
            
            <label class="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                v-model="formData.deliveryMethod"
                value="delivery"
                class="accent-[#155DA5]"
              />
              <div>
                <span class="font-medium text-gray-900">Home Delivery</span>
                <p class="text-sm text-gray-600">Delivery fee: Ksh {{ deliveryFee.toLocaleString() }}</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          @click="$emit('back')"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Back to Cart
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-[#FF8500] text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Address } from '../../types/checkout';

interface Props {
  cartTotal: number;
}

interface Emits {
  (e: 'next', address: Address): void;
  (e: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = ref<Address>({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  deliveryMethod: 'pickup',
});

const errors = ref<Record<string, string>>({});

const deliveryFee = computed(() => {
  if (formData.value.deliveryMethod === 'pickup') return 0;
  
  if (props.cartTotal <= 500) return 150;
  if (props.cartTotal <= 1000) return 200;
  return 300;
});

function validateForm(): boolean {
  const newErrors: Record<string, string> = {};
  
  if (!formData.value.name.trim()) newErrors.name = 'Name is required';
  if (!formData.value.email.trim()) newErrors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.value.email)) newErrors.email = 'Email is invalid';
  if (!formData.value.phone.trim()) newErrors.phone = 'Phone number is required';
  if (!formData.value.address.trim()) newErrors.address = 'Address is required';
  if (!formData.value.city.trim()) newErrors.city = 'City is required';
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function clearError(field: string) {
  if (errors.value[field]) {
    const newErrors = { ...errors.value };
    delete newErrors[field];
    errors.value = newErrors;
  }
}

function validateAndSubmit() {
  if (validateForm()) {
    emit('next', { ...formData.value });
  }
}
</script>