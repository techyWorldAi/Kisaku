<script setup lang="ts">
import { ArrowRight, BadgeCheck, CreditCard, PackageCheck, Truck } from 'lucide-vue-next';

const heroMainProduct = {
  name: 'Blender',
  image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=720&q=85',
};

const heroSideProducts = [
  {
    name: 'Wireless headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=520&q=85',
  },
  {
    name: 'Everyday electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=520&q=85',
  },
];
</script>

<template>
  <section class="hero-shell" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="hero-kicker">Kisaku Supply Agencies</p>
      <h1 id="hero-title">Everyday Products<br />Great Prices<br /><span>Delivered to You</span></h1>
      <p class="hero-description">
        Shop trusted everyday essentials and get them delivered wherever you are in Kenya.
      </p>

      <div class="hero-actions">
        <router-link to="/shop" class="primary-cta">
          Shop now <ArrowRight :size="17" />
        </router-link>
      </div>

      <div class="hero-benefits" aria-label="Shopping benefits">
        <div class="benefit">
          <Truck :size="19" />
          <span>Fast delivery across Kenya</span>
        </div>
        <div class="benefit">
          <CreditCard :size="19" />
          <span>Secure payments</span>
        </div>
        <div class="benefit">
          <BadgeCheck :size="19" />
          <span>Easy returns</span>
        </div>
      </div>
    </div>

    <div class="hero-products" aria-label="Everyday products">
      <div class="hero-image-main">
        <img :src="heroMainProduct.image" :alt="heroMainProduct.name" fetchpriority="high" />
      </div>
      <div class="hero-image-stack">
        <div v-for="product in heroSideProducts" :key="product.name" class="hero-image-small">
          <img :src="product.image" :alt="product.name" loading="lazy" />
        </div>
      </div>
      <div class="hero-image-label"><PackageCheck :size="17" /> Quality for everyday living</div>
    </div>
  </section>
</template>

<style scoped>
.hero-shell {
  display: grid;
  width: min(1240px, calc(100% - 40px));
  min-height: 370px;
  grid-template-columns: minmax(0, 1fr) minmax(390px, 0.85fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
  margin: 18px auto 0;
  padding: clamp(28px, 4vw, 48px);
  overflow: hidden;
  border-radius: 8px;
  background: #075397;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 610px;
}

.hero-kicker {
  margin: 0 0 12px;
  color: #c8dbee;
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.hero-copy h1 span {
  color: #ffb13b;
}

.hero-description {
  max-width: 510px;
  margin: 14px 0 0;
  color: #e0ebf5;
  font-size: 0.96rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin-top: 19px;
}

.primary-cta {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 21px;
  border: 1px solid #f58216;
  border-radius: 5px;
  background: #f58216;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
  transition: background 160ms ease, border-color 160ms ease;
}

.primary-cta:hover {
  border-color: #df700d;
  background: #df700d;
}

.hero-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 11px 18px;
  margin-top: 25px;
}

.benefit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 0.77rem;
  font-weight: 600;
}

.benefit svg {
  flex: 0 0 auto;
  color: #ffb13b;
}

.hero-products {
  position: relative;
  display: grid;
  min-height: 290px;
  grid-template-columns: minmax(0, 1.25fr) minmax(110px, 0.75fr);
  gap: 12px;
  padding-bottom: 27px;
}

.hero-image-main,
.hero-image-small {
  min-width: 0;
  overflow: hidden;
  border: 4px solid rgb(255 255 255 / 90%);
  border-radius: 6px;
  background: #e9eef3;
  box-shadow: 0 12px 26px rgb(0 0 0 / 18%);
}

.hero-image-main img,
.hero-image-small img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-image-stack {
  display: grid;
  min-height: 0;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
}

.hero-image-label {
  position: absolute;
  right: 5px;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 4px;
  background: #fff;
  color: #102c49;
  font-size: 0.72rem;
  font-weight: 650;
}

@media (max-width: 900px) {
  .hero-shell {
    grid-template-columns: minmax(0, 1fr) minmax(270px, 0.8fr);
    gap: 20px;
    padding: 30px;
  }

  .hero-products {
    min-height: 245px;
  }

  .hero-benefits {
    gap: 10px 13px;
  }
}

@media (max-width: 680px) {
  .hero-shell {
    width: calc(100% - 28px);
    min-height: unset;
    grid-template-columns: 1fr;
    gap: 22px;
    margin-top: 12px;
    padding: 25px 20px 20px;
    border-radius: 6px;
  }

  .hero-copy h1 {
    font-size: clamp(2rem, 8.5vw, 2.8rem);
  }

  .hero-description {
    margin-top: 12px;
    font-size: 0.93rem;
  }

  .hero-actions {
    margin-top: 16px;
  }

  .hero-benefits {
    display: flex;
    gap: 10px 14px;
    margin-top: 18px;
  }

  .hero-products {
    width: min(100%, 400px);
    min-height: 220px;
    justify-self: center;
    padding-bottom: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
  }
}
</style>
