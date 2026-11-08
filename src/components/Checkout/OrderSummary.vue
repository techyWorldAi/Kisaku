<template>
  <section class="order-summary">
    <h2>Order summary</h2>

    <div class="summary-items">
      <article v-for="item in props.cartItems" :key="item.id" class="summary-item">
        <div class="summary-image">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <ShoppingBag v-else :size="21" aria-hidden="true" />
        </div>
        <div class="summary-item-copy">
          <h3>{{ item.name }}</h3>
          <p>Qty: {{ item.quantity }}</p>
        </div>
        <strong class="summary-item-price">Ksh {{ (item.price * item.quantity).toLocaleString() }}</strong>
      </article>
    </div>

    <dl class="summary-prices">
      <div>
        <dt>Subtotal ({{ props.cartItems.length }} item{{ props.cartItems.length === 1 ? '' : 's' }})</dt>
        <dd>Ksh {{ props.cartTotal.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>Delivery fee</dt>
        <dd v-if="props.currentStep === 1" class="summary-muted">Calculated at checkout</dd>
        <dd v-else>{{ props.deliveryFee === 0 ? 'Free' : `Ksh ${props.deliveryFee.toLocaleString()}` }}</dd>
      </div>
    </dl>

    <div class="summary-total">
      <strong>Total</strong>
      <strong>Ksh {{ props.totalAmount.toLocaleString() }}</strong>
    </div>

    <div class="summary-secure">
      <ShieldCheck :size="19" aria-hidden="true" />
      <span>Your order is secure and encrypted</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheck, ShoppingBag } from 'lucide-vue-next';
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

<style scoped>
.order-summary {
  position: sticky;
  top: 16px;
  overflow: hidden;
  border: 1px solid #dce5ef;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(16 42 67 / 5%);
}

.order-summary h2 {
  margin: 0;
  padding: 11px 14px;
  background: #0c477f;
  color: #fff;
  font-size: 1rem;
  font-weight: 750;
}

.summary-items {
  padding: 5px 13px 0;
}

.summary-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.summary-item + .summary-item {
  border-top: 1px solid #edf1f5;
}

.summary-image {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  overflow: hidden;
  border-radius: 5px;
  background: #f5f7fa;
  color: #7890aa;
}

.summary-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 3px;
}

.summary-item-copy {
  min-width: 0;
  flex: 1;
}

.summary-item-copy h3 {
  overflow: hidden;
  margin: 0 0 3px;
  color: #17355b;
  font-size: 0.75rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item-copy p {
  margin: 0;
  color: #64748b;
  font-size: 0.68rem;
}

.summary-item-price {
  flex: 0 0 auto;
  color: #102a43;
  font-size: 0.74rem;
}

.summary-prices {
  display: grid;
  gap: 8px;
  margin: 0 13px;
  padding: 10px 0;
  border-top: 1px solid #e6edf4;
  color: #334155;
  font-size: 0.73rem;
}

.summary-prices div,
.summary-total {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.summary-prices dt,
.summary-prices dd {
  margin: 0;
}

.summary-prices dd {
  text-align: right;
}

.summary-muted {
  max-width: 118px;
  color: #64748b;
}

.summary-total {
  margin: 0 8px;
  padding: 9px 10px;
  border-radius: 6px;
  background: #eaf3ff;
  color: #075397;
  font-size: 1.05rem;
}

.summary-secure {
  display: flex;
  min-height: 39px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 7px 8px 8px;
  border-radius: 5px;
  background: #f0fbf4;
  color: #16803c;
  font-size: 0.7rem;
  font-weight: 650;
}

@media (max-width: 850px) {
  .order-summary {
    position: static;
  }
}
</style>
