<template>
  <section class="delivery-form">
    <h1 class="delivery-heading">
      <MapPin :size="21" aria-hidden="true" />
      <span>Delivery Information<small>Where should we deliver your order?</small></span>
    </h1>

    <form class="delivery-fields" @submit.prevent="validateAndSubmit">
      <div class="field-grid">
        <div class="field">
          <label for="name">Full name <span>*</span></label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            autocomplete="name"
            :aria-invalid="Boolean(errors.name)"
            :class="{ 'has-error': errors.name }"
            placeholder="Enter your full name"
            @input="clearError('name')"
          />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label for="email">Email address <span>*</span></label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :class="{ 'has-error': errors.email }"
            placeholder="Enter your email"
            @input="clearError('email')"
          />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label for="phone">Phone number <span>*</span></label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            autocomplete="tel"
            :aria-invalid="Boolean(errors.phone)"
            :class="{ 'has-error': errors.phone }"
            placeholder="07XX XXX XXX or +254 XXX XXX"
            @input="clearError('phone')"
          />
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
        </div>

        <div class="field">
          <label for="city">City or town <span>*</span></label>
          <input
            id="city"
            v-model="formData.city"
            type="text"
            autocomplete="address-level2"
            :aria-invalid="Boolean(errors.city)"
            :class="{ 'has-error': errors.city }"
            placeholder="Enter your city or town"
            @input="clearError('city')"
          />
          <p v-if="errors.city" class="field-error">{{ errors.city }}</p>
        </div>

        <div class="field field-wide">
          <label for="address">Delivery address <span>*</span></label>
          <textarea
            id="address"
            v-model="formData.address"
            rows="2"
            autocomplete="street-address"
            :aria-invalid="Boolean(errors.address)"
            :class="{ 'has-error': errors.address }"
            placeholder="Street address, building, apartment, or nearby landmark"
            @input="clearError('address')"
          ></textarea>
          <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
        </div>
      </div>

      <fieldset class="delivery-options">
        <legend>Delivery option</legend>
        <div class="delivery-option-grid">
          <label class="delivery-option" :class="{ 'is-selected': formData.deliveryMethod === 'pickup' }">
            <input v-model="formData.deliveryMethod" type="radio" value="pickup" />
            <Store :size="21" aria-hidden="true" />
            <span><strong>Shop pickup</strong><small>Collect from our store</small></span>
            <b>Free</b>
          </label>
          <label class="delivery-option" :class="{ 'is-selected': formData.deliveryMethod === 'delivery' }">
            <input v-model="formData.deliveryMethod" type="radio" value="delivery" />
            <Truck :size="21" aria-hidden="true" />
            <span><strong>Home delivery</strong><small>Delivery to your address</small></span>
            <b>Ksh {{ deliveryFee.toLocaleString() }}</b>
          </label>
        </div>
      </fieldset>

      <div class="delivery-actions">
        <button class="continue-shopping" type="button" @click="$emit('back')">
          <ArrowLeft :size="17" aria-hidden="true" />
          Continue shopping
        </button>
        <button class="continue-payment" type="submit">
          Continue to payment
          <ArrowRight :size="17" aria-hidden="true" />
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight, MapPin, Store, Truck } from 'lucide-vue-next';
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

<style scoped>
.delivery-form {
  display: grid;
  gap: 16px;
}

.delivery-heading {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  color: #0c3970;
  font-size: 1.15rem;
  font-weight: 750;
}

.delivery-heading > svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.delivery-heading span {
  display: grid;
  gap: 3px;
}

.delivery-heading small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 400;
}

.delivery-fields {
  display: grid;
  gap: 12px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.field {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 5px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field label,
.delivery-options legend {
  color: #263b56;
  font-size: 0.76rem;
  font-weight: 700;
}

.field label span {
  color: #dc2626;
}

.field input,
.field textarea {
  width: 100%;
  min-width: 0;
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid #cbd8e8;
  border-radius: 5px;
  background: #fff;
  color: #102a43;
  font-size: 0.8rem;
}

.field textarea {
  min-height: 52px;
  resize: vertical;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #8795a8;
}

.field input:focus,
.field textarea:focus {
  border-color: #155da5;
  outline: 3px solid rgb(21 93 165 / 12%);
}

.field input.has-error,
.field textarea.has-error {
  border-color: #dc2626;
}

.field-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.72rem;
}

.delivery-options {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.delivery-options legend {
  margin-bottom: 7px;
}

.delivery-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.delivery-option {
  display: flex;
  min-width: 0;
  min-height: 54px;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 1px solid #dce5ef;
  border-radius: 6px;
  color: #0c3970;
  cursor: pointer;
}

.delivery-option.is-selected {
  border-color: #8db4dc;
  background: #f0f6ff;
}

.delivery-option input {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  margin: 0;
  accent-color: #075397;
}

.delivery-option > svg {
  flex: 0 0 auto;
}

.delivery-option span {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.delivery-option strong {
  color: #17355b;
  font-size: 0.76rem;
}

.delivery-option small {
  overflow: hidden;
  color: #64748b;
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delivery-option b {
  flex: 0 0 auto;
  color: #075397;
  font-size: 0.7rem;
}

.delivery-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 2px;
}

.delivery-actions button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border: 0;
  border-radius: 6px;
  font-size: 0.79rem;
  font-weight: 700;
  cursor: pointer;
}

.continue-shopping {
  background: transparent;
  color: #075397;
}

.continue-shopping:hover {
  background: #f0f6ff;
}

.continue-payment {
  background: #f58216;
  color: #fff;
}

.continue-payment:hover {
  background: #df700d;
}

@media (max-width: 560px) {
  .field-grid,
  .delivery-option-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .delivery-actions {
    align-items: stretch;
  }

  .delivery-actions button {
    padding-right: 10px;
    padding-left: 10px;
    font-size: 0.72rem;
  }
}
</style>