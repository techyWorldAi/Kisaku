<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingBag, ShoppingCart, Star } from 'lucide-vue-next';
import { productAPI } from '../../services/api';
import type { Product } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';

const cache = new Map<number, Product[]>();
const props = defineProps<{ productId: number }>();
const limit = 8;
const products = ref<Product[]>([]);
const loading = ref(false);
const unavailableImages = ref(new Set<number>());
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
let requestId = 0;

const showSection = computed(() => loading.value || products.value.length > 0);

function discountPercentage(product: Product) {
  const originalPrice = Number(product.original_price);
  const price = Number(product.price);
  if (!Number.isFinite(originalPrice) || originalPrice <= price || price <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

function rating(product: Product) {
  const value = Number(product.rating);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function reviewCount(product: Product) {
  const value = Number(product.review_count);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function addToCart(product: Product) {
  if (product.stock <= 0) return;
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  cartStore.addToCart({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: 1,
    image: product.image,
  });
}

async function load(productId: number) {
  const currentRequest = ++requestId;
  unavailableImages.value = new Set<number>();
  const cachedProducts = cache.get(productId);
  if (cachedProducts) {
    products.value = cachedProducts;
    loading.value = false;
    return;
  }

  products.value = [];
  loading.value = true;
  try {
    const result = await productAPI.getRelatedProducts(productId, limit);
    cache.set(productId, result);
    if (currentRequest === requestId) products.value = result;
  } catch {
    if (currentRequest === requestId) products.value = [];
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

watch(() => props.productId, (productId) => {
  if (Number.isSafeInteger(productId) && productId > 0) void load(productId);
  else {
    requestId += 1;
    products.value = [];
    loading.value = false;
  }
}, { immediate: true });
</script>

<template>
  <section v-if="showSection" class="related-section" aria-labelledby="related-products-heading">
    <header class="related-heading">
      <h2 id="related-products-heading">You might also like</h2>
    </header>
    <div class="related-track" :aria-busy="loading">
      <template v-if="loading">
        <div v-for="index in limit" :key="`skeleton-${index}`" class="related-card related-skeleton">
          <div class="skeleton-image" />
          <div class="skeleton-line" />
          <div class="skeleton-line short" />
          <div class="skeleton-button" />
        </div>
      </template>
      <article v-for="product in products" v-else :key="product.id" class="related-card">
        <router-link :to="`/product/${product.id}`" class="related-media" :aria-label="product.name">
          <span v-if="product.stock <= 0" class="stock-badge">Out of stock</span>
          <img
            v-if="product.image && !unavailableImages.has(product.id)"
            :src="product.image"
            :alt="product.name"
            loading="lazy"
            @error="unavailableImages.add(product.id)"
          >
          <span v-else class="image-fallback">
            <ShoppingBag :size="28" aria-hidden="true" />
            <span>Image unavailable</span>
          </span>
          <span v-if="product.stock > 0 && discountPercentage(product) > 0" class="sale-badge">-{{ discountPercentage(product) }}%</span>
        </router-link>
        <div class="related-info">
          <router-link :to="`/product/${product.id}`" class="related-title">{{ product.name }}</router-link>
          <div class="related-prices">
            <strong>KSh {{ Number(product.price).toLocaleString() }}</strong>
            <del v-if="discountPercentage(product) > 0">KSh {{ Number(product.original_price).toLocaleString() }}</del>
          </div>
          <div v-if="rating(product) !== null" class="related-rating">
            <Star :size="13" fill="currentColor" aria-hidden="true" />
            <span>{{ rating(product)?.toFixed(1) }}</span>
            <span v-if="reviewCount(product) !== null" class="review-count">({{ reviewCount(product)?.toLocaleString() }})</span>
          </div>
          <button type="button" class="related-cart" :disabled="product.stock <= 0" @click="addToCart(product)">
            <ShoppingCart :size="15" aria-hidden="true" />
            {{ product.stock <= 0 ? 'Out of stock' : 'Add to Cart' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.related-section{margin-top:42px;min-width:0}.related-heading{margin-bottom:16px}.related-heading h2{margin:0;color:#102c49;font-size:clamp(1.4rem,2vw,1.8rem);font-weight:750;letter-spacing:-.035em}.related-track{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 10px;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin}.related-card{position:relative;display:flex;min-width:0;flex:0 0 calc((100% - 36px)/4);flex-direction:column;overflow:hidden;border:1px solid #e4eaf2;border-radius:8px;background:#fff;scroll-snap-align:start}.related-media{position:relative;display:flex;width:100%;aspect-ratio:4/3;align-items:center;justify-content:center;overflow:hidden;background:#f7f8fa}.related-media img{width:100%;height:100%;object-fit:cover}.image-fallback{display:flex;width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#f1f5f9;color:#94a3b8;font-size:.72rem}.stock-badge,.sale-badge{position:absolute;z-index:1;top:7px;left:7px;padding:4px 6px;border-radius:4px;background:#e52429;color:#fff;font-size:.68rem;font-weight:750;line-height:1}.stock-badge{background:#fff;color:#64748b}.related-info{display:flex;flex:1;flex-direction:column;gap:9px;padding:12px}.related-title{display:-webkit-box;overflow:hidden;color:#102c49;font-size:.9rem;font-weight:700;text-decoration:none;-webkit-box-orient:vertical;-webkit-line-clamp:2}.related-title:hover{color:#075397}.related-prices{display:flex;flex-wrap:wrap;align-items:baseline;gap:7px}.related-prices strong{color:#102c49;font-size:.95rem}.related-prices del{color:#94a3b8;font-size:.78rem}.related-rating{display:flex;align-items:center;gap:4px;color:#b7791f;font-size:.78rem}.review-count{color:#64748b}.related-cart{display:flex;min-height:36px;align-items:center;justify-content:center;gap:6px;margin-top:auto;border:0;border-radius:5px;background:#0b5aa5;color:#fff;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer}.related-cart:disabled{background:#e2e8f0;color:#64748b;cursor:not-allowed}.related-skeleton{padding-bottom:12px}.skeleton-image,.skeleton-line,.skeleton-button{animation:pulse 1.4s ease-in-out infinite;background:#e8edf2}.skeleton-image{aspect-ratio:4/3}.skeleton-line{height:12px;margin:12px 12px 0;border-radius:4px}.skeleton-line.short{width:55%;margin-top:8px}.skeleton-button{height:36px;margin:12px 12px 0;border-radius:5px}@keyframes pulse{50%{opacity:.55}}@media(max-width:900px){.related-card{flex-basis:calc((100% - 24px)/3)}}@media(max-width:640px){.related-section{margin-top:32px}.related-track{gap:10px}.related-card{flex-basis:calc((100% - 10px)/2)}.related-info{padding:10px}.related-title{font-size:.82rem}}@media(prefers-reduced-motion:reduce){.skeleton-image,.skeleton-line,.skeleton-button{animation:none}}
</style>
