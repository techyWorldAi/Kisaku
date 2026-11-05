<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CreditCard,
  Headphones,
  House,
  MonitorSmartphone,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { productAPI } from '../../services/api';
import type { Category, Product } from '../../services/api';

const categoryDefinitions = [
  {
    label: 'Home & Kitchen',
    keys: ['home', 'kitchen', 'appliance'],
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=640&q=80',
    icon: House,
  },
  {
    label: 'Tech & Electronics',
    keys: ['tech', 'electronic', 'phone', 'computer'],
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=640&q=80',
    icon: MonitorSmartphone,
  },
  {
    label: 'Beauty & Personal Care',
    keys: ['beauty', 'personal', 'care', 'cosmetic'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=640&q=80',
    icon: Sparkles,
  },
  {
    label: 'Fashion & Lifestyle',
    keys: ['fashion', 'lifestyle', 'clothing', 'apparel'],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=80',
    icon: ShoppingBag,
  },
  {
    label: 'Automotive',
    keys: ['auto', 'motor', 'car', 'vehicle'],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=640&q=80',
    icon: CarFront,
  },
];

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const loadError = ref(false);
const unavailableImages = ref(new Set<number>());
const unavailableCategoryImages = ref(new Set<string>());
const addedProductId = ref<number | null>(null);
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;

const categoryCards = computed(() =>
  categoryDefinitions.map((definition) => {
    const category = categories.value.find((item) => {
      const name = item.name.toLowerCase();
      return definition.keys.some((key) => name.includes(key));
    });

    return {
      id: category?.id,
      name: category?.name ?? definition.label,
      image: definition.image,
      icon: definition.icon,
    };
  }),
);

const featuredProducts = computed(() => products.value.slice(0, 5));

function categoryLink(categoryId?: number) {
  return categoryId
    ? { path: '/shop', query: { category: String(categoryId) } }
    : { path: '/shop' };
}

function addProduct(product: Product) {
  if (product.stock <= 0) return;

  cartStore.addToCart({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: 1,
    image: product.image,
  });
}

function addToCart(product: Product) {
  if (product.stock <= 0) return;
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  addProduct(product);
  addedProductId.value = product.id;
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    addedProductId.value = null;
  }, 1600);
}

function buyNow(product: Product) {
  if (product.stock <= 0) return;
  addProduct(product);

  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  void router.push('/checkout');
}

async function fetchProducts() {
  loading.value = true;
  loadError.value = false;

  try {
    const data = await productAPI.getPublicProducts();
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load storefront products:', error);
    loadError.value = true;
    products.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await productAPI.getCategories();
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load product categories:', error);
  }
}

onMounted(() => {
  void fetchProducts();
  void fetchCategories();
});
</script>

<template>
  <main class="catalog-shell">
    <section id="categories" class="catalog-section">
      <header class="section-heading">
        <div>
          <p class="eyebrow">Find what you need</p>
          <h2>Shop by category</h2>
        </div>
        <router-link to="/shop" class="section-link">
          Browse all <ArrowRight :size="16" />
        </router-link>
      </header>

      <div class="category-grid">
        <router-link
          v-for="category in categoryCards"
          :key="category.name"
          :to="categoryLink(category.id)"
          class="category-card"
        >
          <img
            v-if="!unavailableCategoryImages.has(category.name)"
            class="category-image"
            :src="category.image"
            :alt="category.name"
            loading="lazy"
            @error="unavailableCategoryImages.add(category.name)"
          />
          <span class="category-overlay" />
          <span class="category-content">
            <component :is="category.icon" :size="19" aria-hidden="true" />
            <span>{{ category.name }}</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </span>
        </router-link>
      </div>
    </section>

    <section id="featured" class="catalog-section product-section">
      <header class="section-heading">
        <div>
          <p class="eyebrow">Selected from our live catalogue</p>
          <h2>Featured products</h2>
        </div>
        <router-link to="/shop" class="section-link">
          View all products <ArrowRight :size="16" />
        </router-link>
      </header>

      <div class="featured-layout">
        <div class="featured-content">
          <div v-if="loading" class="product-grid" aria-label="Loading products" aria-busy="true">
            <div v-for="index in 5" :key="index" class="product-skeleton">
              <div class="skeleton-image" />
              <div class="skeleton-line" />
              <div class="skeleton-line short" />
              <div class="skeleton-button" />
            </div>
          </div>

          <div v-else-if="loadError" class="catalog-message" role="alert">
            <span class="message-icon"><ShoppingBag :size="22" /></span>
            <h3>Products are temporarily unavailable</h3>
            <p>We couldn't connect to the catalogue. Please try again in a moment.</p>
            <button class="retry-button" type="button" @click="fetchProducts">
              <RefreshCw :size="15" /> Try again
            </button>
          </div>

          <div v-else-if="featuredProducts.length" class="product-grid">
            <article v-for="product in featuredProducts" :key="product.id" class="product-card">
              <router-link :to="`/product/${product.id}`" class="product-media">
                <span v-if="product.stock <= 0" class="stock-badge">Out of stock</span>
                <img
                  v-if="product.image && !unavailableImages.has(product.id)"
                  :src="product.image"
                  :alt="product.name"
                  loading="lazy"
                  @error="unavailableImages.add(product.id)"
                />
                <span v-else class="image-fallback">
                  <ShoppingBag :size="32" stroke-width="1.5" />
                  <span>Image unavailable</span>
                </span>
              </router-link>

              <div class="product-info">
                <router-link :to="`/product/${product.id}`" class="product-title">
                  {{ product.name }}
                </router-link>
                <p v-if="product.category?.name" class="product-category">
                  {{ product.category.name }}
                </p>
                <p class="product-price">KSh {{ Number(product.price).toLocaleString() }}</p>
                <div class="product-action-row">
                  <button
                    class="product-action product-action-buy"
                    :disabled="product.stock <= 0"
                    type="button"
                    @click="buyNow(product)"
                  >
                    <Zap :size="15" aria-hidden="true" />
                    Buy now
                  </button>
                  <button
                    class="product-action product-action-cart"
                    :class="{ added: addedProductId === product.id }"
                    :disabled="product.stock <= 0"
                    type="button"
                    @click="addToCart(product)"
                  >
                    <ShoppingCart :size="15" aria-hidden="true" />
                    {{ addedProductId === product.id ? 'Added' : 'Add to cart' }}
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="catalog-message" role="status">
            <span class="message-icon"><ShoppingBag :size="22" /></span>
            <h3>The catalogue is being updated</h3>
            <p>There are no products to display right now. Please check back soon.</p>
            <button class="retry-button" type="button" @click="fetchProducts">
              <RefreshCw :size="15" /> Refresh catalogue
            </button>
          </div>
        </div>

        <aside class="catalog-promo">
          <p class="promo-kicker">Kisaku Supply Agencies</p>
          <h3>Everyday essentials, all in one place.</h3>
          <p>Browse the full catalogue and find the right products for your home and day.</p>
          <router-link to="/shop" class="promo-link">
            Explore products <ArrowRight :size="16" />
          </router-link>
          <ShoppingBag class="promo-art" :size="92" stroke-width="1" aria-hidden="true" />
        </aside>
      </div>
    </section>

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
  </main>
</template>

<style scoped>
.catalog-shell {
  width: min(1240px, calc(100% - 40px));
  margin: 0 auto;
  padding: 34px 0 52px;
  color: #111827;
}

.catalog-section + .catalog-section {
  margin-top: 40px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 5px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: #102c49;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  font-weight: 750;
  letter-spacing: -0.035em;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: #075397;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.section-link:hover,
.promo-link:hover {
  color: #f58216;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.category-card {
  position: relative;
  display: flex;
  min-height: 150px;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 7px;
  background: #e8edf2;
  color: #fff;
  text-decoration: none;
}

.category-image,
.category-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.category-image {
  object-fit: cover;
  transition: transform 200ms ease;
}

.category-overlay {
  background: linear-gradient(0deg, rgb(16 44 73 / 88%), rgb(16 44 73 / 0%) 76%);
}

.category-card:hover .category-image,
.category-card:focus-visible .category-image {
  transform: scale(1.045);
}

.category-content {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.category-content span {
  flex: 1;
}

.product-section {
  scroll-margin-top: 150px;
}

.featured-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 14px;
}

.featured-content {
  min-width: 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.product-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  background: #fff;
  transition: box-shadow 160ms ease, transform 160ms ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgb(16 44 73 / 10%);
}

.product-media {
  position: relative;
  display: flex;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f7f8fa;
}

.product-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 180ms ease;
}

.product-card:hover .product-media img {
  transform: scale(1.035);
}

.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.74rem;
}

.stock-badge {
  position: absolute;
  z-index: 1;
  top: 8px;
  left: 8px;
  padding: 4px 7px;
  border-radius: 3px;
  background: #fff;
  color: #64748b;
  font-size: 0.67rem;
  font-weight: 700;
}

.product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 11px;
}

.product-title {
  display: -webkit-box;
  min-height: 38px;
  overflow: hidden;
  color: #24364b;
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-title:hover {
  color: #075397;
}

.product-category {
  margin: 5px 0 0;
  overflow: hidden;
  color: #64748b;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin: 9px 0 11px;
  color: #111827;
  font-size: 1rem;
  font-weight: 750;
}

.catalog-promo {
  position: relative;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  padding: 22px 18px;
  border-radius: 6px;
  background: #102c49;
  color: #fff;
}

.promo-kicker {
  margin: 0 0 14px;
  color: #ffbd76;
  font-size: 0.69rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-promo h3 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.35rem;
  font-weight: 750;
  line-height: 1.25;
}

.catalog-promo > p:not(.promo-kicker) {
  position: relative;
  z-index: 1;
  margin: 12px 0 20px;
  color: #d3deea;
  font-size: 0.82rem;
  line-height: 1.55;
}

.promo-link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.promo-art {
  position: absolute;
  right: -17px;
  bottom: 36px;
  color: rgb(255 255 255 / 9%);
}

.catalog-message {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  background: #fff;
  text-align: center;
}

.message-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f5fa;
  color: #075397;
}

.catalog-message h3 {
  margin: 13px 0 4px;
  color: #102c49;
  font-size: 1rem;
}

.catalog-message p {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  padding: 9px 13px;
  border: 0;
  border-radius: 4px;
  background: #075397;
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
}

.retry-button:hover {
  background: #06477f;
}

.product-skeleton {
  min-height: 310px;
  padding: 9px;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  background: #fff;
}

.skeleton-image,
.skeleton-line,
.skeleton-button {
  background: linear-gradient(90deg, #f1f3f5 25%, #e8ebef 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-image {
  height: 174px;
  border-radius: 4px;
}

.skeleton-line {
  height: 11px;
  margin-top: 15px;
  border-radius: 5px;
}

.skeleton-line.short {
  width: 55%;
  margin-top: 9px;
}

.skeleton-button {
  height: 37px;
  margin-top: 22px;
  border-radius: 4px;
}

.service-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 36px;
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

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@media (max-width: 1100px) {
  .featured-layout {
    grid-template-columns: minmax(0, 1fr) 190px;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .service-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .catalog-shell {
    width: calc(100% - 28px);
    padding: 30px 0 38px;
  }

  .catalog-section + .catalog-section {
    margin-top: 32px;
  }

  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 9px;
  }

  .category-card {
    min-height: 130px;
  }

  .category-content {
    gap: 6px;
    padding: 11px 9px;
    font-size: 0.75rem;
  }

  .featured-layout {
    grid-template-columns: 1fr;
  }

  .catalog-promo {
    min-height: 180px;
  }
}

@media (max-width: 560px) {
  .section-heading {
    align-items: flex-start;
    margin-bottom: 13px;
  }

  .section-heading h2 {
    font-size: 1.35rem;
  }

  .section-link {
    padding-top: 15px;
    font-size: 0.77rem;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-card {
    min-height: 122px;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .product-info {
    padding: 10px;
  }

  .product-title {
    min-height: 38px;
    font-size: 0.8rem;
  }

  .product-price {
    font-size: 0.95rem;
  }

  .add-button {
    min-height: 40px;
    font-size: 0.73rem;
  }

  .service-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px 10px;
    margin-top: 28px;
  }

  .service-item {
    gap: 8px;
  }

  .service-item strong {
    font-size: 0.73rem;
  }

  .service-item small {
    font-size: 0.66rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
