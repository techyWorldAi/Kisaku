<script setup lang="ts">
import { BadgeCheck, CreditCard, Headphones, PackageCheck, Truck } from 'lucide-vue-next';
</script>

<template>
  <section class="service-strip" aria-label="Shopping information">
    <div class="service-item">
      <span class="service-icon"><Truck :size="20" /></span>
      <span><strong>Nationwide delivery</strong><small>Across Kenya</small></span>
    </div>
    <div class="service-item">
      <span class="service-icon"><BadgeCheck :size="20" /></span>
      <span><strong>Quality assured</strong><small>Trusted products</small></span>
    </div>
    <div class="service-item">
      <span class="service-icon"><CreditCard :size="20" /></span>
      <span><strong>Secure payments</strong><small>M-Pesa and cards</small></span>
    </div>
    <div class="service-item">
      <span class="service-icon"><PackageCheck :size="20" /></span>
      <span><strong>Easy order support</strong><small>Track your orders</small></span>
    </div>
    <div class="service-item">
      <span class="service-icon"><Headphones :size="20" /></span>
      <span><strong>Customer support</strong><small>We're here to help</small></span>
    </div>
  </section>
</template>

<style scoped>
.service-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  width: min(1240px, calc(100% - 40px));
  margin: 0 auto 32px;
  padding: 20px 0;
  border-top: 1px solid #e3e8ee;
  border-bottom: 1px solid #e3e8ee;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eff5fa;
  color: #075397;
}

.service-item > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.service-item strong {
  color: #102c49;
  font-size: 0.78rem;
}

.service-item small {
  color: #64748b;
  font-size: 0.71rem;
}

@media (max-width: 1100px) {
  .service-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .service-strip {
    width: calc(100% - 28px);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px 10px;
    margin-bottom: 24px;
  }

  .service-item strong {
    font-size: 0.72rem;
  }

  .service-item small {
    font-size: 0.67rem;
  }
}

@media (max-width: 380px) {
  .service-strip {
    grid-template-columns: 1fr;
  }
}
</style>
