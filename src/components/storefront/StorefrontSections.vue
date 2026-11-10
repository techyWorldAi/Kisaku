<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Heart, ShoppingBag, ShoppingCart, Star } from 'lucide-vue-next';
import { productAPI } from '../../services/api';
import type { Category, Product, StorefrontBanner, StorefrontSection } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';

const props = defineProps<{
  sections: StorefrontSection[];
  banners: StorefrontBanner[];
}>();

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const productLoadError = ref(false);
const unavailableImages = ref(new Set<number>());
const addedProductId = ref<number | null>(null);
const bannerIndices = ref<Record<number, number>>({});
const pausedCarousels = ref<Record<number, boolean>>({});
const bannerTimers = new Map<number, ReturnType<typeof setInterval>>();
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;

const visibleSections = computed(() => props.sections
  .filter((section) => section.is_visible && section.section_key !== 'hero' && section.section_key !== 'categories')
  .filter((section) => !/^(category|product-row)-\d+$/.test(section.section_key))
  .filter((section) => ['banner_carousel', 'product_row', 'promo', 'rich_text', 'feature_list'].includes(section.type))
  .sort((a, b) => a.sort_order - b.sort_order));

const activeBanners = computed(() => props.banners
  .filter((banner) => banner.is_active)
  .sort((a, b) => a.sort_order - b.sort_order));

function productsFor(section: StorefrontSection) {
  const source = section.config.source;
  const filtered = source === 'category'
    ? products.value.filter((product) => product.category_id === section.config.category_id)
    : [...products.value];
  if (source === 'newest') {
    filtered.sort((a, b) => {
      const timeA = Date.parse(a.created_at ?? '');
      const timeB = Date.parse(b.created_at ?? '');
      if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeB - timeA;
      return b.id - a.id;
    });
  } else if (source === 'featured') {
    filtered.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
  }
  const limit = section.config.limit;
  return filtered.slice(0, typeof limit === 'number' && limit > 0 ? limit : 8);
}

function productRowPromo(section: StorefrontSection) {
  return props.sections.find((candidate) => (
    candidate.type === 'promo'
    && candidate.section_key === `product-row-${section.id}`
    && candidate.is_visible
  ));
}

function promotionColor(section: StorefrontSection, key: 'background_color' | 'text_color', fallback: string) {
  const color = section.config[key];
  return typeof color === 'string' && /^#[\da-f]{6}$/i.test(color) ? color : fallback;
}

function discountPercentage(product: Product) {
  const originalPrice = Number(product.original_price);
  const price = Number(product.price);
  if (!Number.isFinite(originalPrice) || originalPrice <= price || price <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

function getProductRating(product: Product) {
  const rating = Number(product.rating);
  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

function getProductReviewCount(product: Product) {
  const reviewCount = Number(product.review_count);
  return Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : null;
}

function getProductCategory(product: Product) {
  return product.category?.name
    ?? categories.value.find((category) => category.id === product.category_id)?.name;
}

function toggleWishlist(product: Product) {
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  wishlistStore.toggle(product.id);
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
  addedProductId.value = product.id;
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    addedProductId.value = null;
  }, 1600);
}

function markImageUnavailable(productId: number) {
  unavailableImages.value.add(productId);
}

function promotionLink(value: unknown) {
  return typeof value === 'string'
    && (/^https?:\/\/\S+$/i.test(value) || value.startsWith('/') && !value.startsWith('//'))
    ? value
    : '/shop';
}

function isExternalLink(value: string) {
  return /^https?:\/\//i.test(value);
}

function featureItems(section: StorefrontSection): Array<{ icon?: string; title: string; text?: string }> {
  const items = section.config.items;
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is { icon?: string; title: string; text?: string } => (
    typeof item === 'object'
    && item !== null
    && 'title' in item
    && typeof item.title === 'string'
  ));
}

function currentBanner(section: StorefrontSection) {
  const index = bannerIndices.value[section.id] ?? 0;
  return activeBanners.value[index] ?? activeBanners.value[0];
}

function moveBanner(section: StorefrontSection, direction: -1 | 1) {
  const count = activeBanners.value.length;
  if (count < 2) return;
  const current = bannerIndices.value[section.id] ?? 0;
  bannerIndices.value = { ...bannerIndices.value, [section.id]: (current + direction + count) % count };
}

function startBannerTimer(section: StorefrontSection) {
  if (bannerTimers.has(section.id) || section.config.autoplay !== true || activeBanners.value.length < 2) return;
  const interval = section.config.interval_ms;
  const delay = typeof interval === 'number' && interval >= 2000 && interval <= 30000 ? interval : 5000;
  bannerTimers.set(section.id, setInterval(() => moveBanner(section, 1), delay));
}

function toggleBannerAutoplay(section: StorefrontSection) {
  const timer = bannerTimers.get(section.id);
  if (timer) {
    clearInterval(timer);
    bannerTimers.delete(section.id);
    pausedCarousels.value = { ...pausedCarousels.value, [section.id]: true };
    return;
  }
  pausedCarousels.value = { ...pausedCarousels.value, [section.id]: false };
  startBannerTimer(section);
}

watch(visibleSections, (sections) => {
  if (sections.some((section) => section.type === 'product_row') && products.value.length === 0 && !productLoadError.value) {
    void loadProducts();
  }
  for (const section of sections) {
    if (section.type === 'banner_carousel' && pausedCarousels.value[section.id] !== true) startBannerTimer(section);
  }
}, { immediate: true });

async function loadProducts() {
  try {
    const result = await productAPI.getPublicProducts();
    products.value = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to load products for storefront sections:', error);
    productLoadError.value = true;
    return;
  }

  try {
    const result = await productAPI.getCategories();
    categories.value = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to load categories for storefront product cards:', error);
  }
}

onUnmounted(() => {
  bannerTimers.forEach((timer) => clearInterval(timer));
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
});
</script>

<template>
  <div class="storefront-extra-sections">
    <section
      v-for="section in visibleSections"
      :key="section.id"
      class="storefront-extra-section"
      :class="{ 'storefront-product-row-section': section.type === 'product_row' }"
    >
      <template v-if="section.type === 'banner_carousel' && activeBanners.length">
        <header v-if="section.title" class="extra-heading"><h2>{{ section.title }}</h2></header>
        <div v-if="currentBanner(section)" class="banner-list" role="group" :aria-label="section.title || 'Store promotions'">
          <a
            :key="currentBanner(section)!.id"
            :href="promotionLink(currentBanner(section)!.link_url)"
            class="banner-item"
          >
            <img :src="currentBanner(section)!.image_url" :alt="currentBanner(section)!.alt_text || currentBanner(section)!.title" loading="lazy" />
          </a>
          <div v-if="activeBanners.length > 1" class="banner-controls" role="group" :aria-label="`${section.title || 'Promotion'} controls`">
            <button type="button" :aria-label="`Previous ${section.title || 'promotion'}`" @click="moveBanner(section, -1)">‹</button>
            <span aria-live="polite">{{ (bannerIndices[section.id] ?? 0) + 1 }} / {{ activeBanners.length }}</span>
            <button
              v-if="section.config.autoplay === true"
              type="button"
              :aria-label="pausedCarousels[section.id] ? 'Resume automatic promotion rotation' : 'Pause automatic promotion rotation'"
              @click="toggleBannerAutoplay(section)"
            >
              {{ pausedCarousels[section.id] ? 'Play' : 'Pause' }}
            </button>
            <button type="button" :aria-label="`Next ${section.title || 'promotion'}`" @click="moveBanner(section, 1)">›</button>
          </div>
        </div>
      </template>

      <template v-else-if="section.type === 'product_row'">
        <header class="extra-heading">
          <div>
            <p class="product-row-eyebrow">Selected from our live catalogue</p>
            <h2>{{ section.title || 'Featured products' }}</h2>
          </div>
          <router-link to="/shop" class="extra-link">View all products <ArrowRight :size="16" /></router-link>
        </header>
        <p v-if="productLoadError" class="extra-message" role="status">Products are temporarily unavailable.</p>
        <div
          v-else-if="productsFor(section).length"
          class="featured-layout"
          :class="{ 'has-product-row-promo': productRowPromo(section) }"
        >
          <div class="extra-product-grid">
            <article v-for="product in productsFor(section)" :key="product.id" class="extra-product-card">
              <router-link :to="`/product/${product.id}`" class="extra-product-media">
                <span v-if="product.stock <= 0" class="extra-stock-badge">Out of stock</span>
                <span v-else-if="discountPercentage(product) > 0" class="extra-sale-badge">
                  -{{ discountPercentage(product) }}%
                </span>
                <img
                  v-if="product.image && !unavailableImages.has(product.id)"
                  :src="product.image"
                  :alt="product.name"
                  loading="lazy"
                  @error="markImageUnavailable(product.id)"
                />
                <span v-else class="extra-product-fallback">
                  <ShoppingBag :size="28" />
                  <span>Image unavailable</span>
                </span>
              </router-link>
              <button
                type="button"
                class="extra-wishlist-toggle"
                :class="{ saved: wishlistStore.isSaved(product.id) }"
                :aria-label="wishlistStore.isSaved(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
                :aria-pressed="wishlistStore.isSaved(product.id)"
                @click="toggleWishlist(product)"
              >
                <Heart :size="17" :fill="wishlistStore.isSaved(product.id) ? 'currentColor' : 'none'" />
              </button>
              <div class="extra-product-info">
                <router-link :to="`/product/${product.id}`" class="extra-product-title">
                  {{ product.name }}
                </router-link>
                <span v-if="getProductCategory(product)" class="extra-product-category">
                  {{ getProductCategory(product) }}
                </span>
                <div class="extra-product-prices">
                  <strong>KSh {{ Number(product.price).toLocaleString() }}</strong>
                  <del v-if="discountPercentage(product) > 0">
                    KSh {{ Number(product.original_price).toLocaleString() }}
                  </del>
                </div>
                <div v-if="getProductRating(product) !== null" class="extra-product-rating">
                  <Star :size="14" fill="currentColor" aria-hidden="true" />
                  <span>{{ getProductRating(product)?.toFixed(1) }}</span>
                  <span v-if="getProductReviewCount(product) !== null" class="extra-review-count">
                    ({{ getProductReviewCount(product)?.toLocaleString() }})
                  </span>
                </div>
                <button
                  type="button"
                  class="extra-add-to-cart"
                  :class="{ added: addedProductId === product.id }"
                  :disabled="product.stock <= 0"
                  @click="addToCart(product)"
                >
                  <ShoppingCart :size="17" aria-hidden="true" />
                  {{ addedProductId === product.id ? 'Added to Cart' : 'Add to Cart' }}
                </button>
              </div>
            </article>
          </div>
          <aside
            v-if="productRowPromo(section)"
            class="product-row-promo"
            :class="{ 'has-promo-image': typeof productRowPromo(section)?.config.image_url === 'string' && productRowPromo(section)?.config.image_url }"
            :style="{
              backgroundColor: promotionColor(productRowPromo(section)!, 'background_color', '#102C49'),
              color: promotionColor(productRowPromo(section)!, 'text_color', '#FFFFFF'),
            }"
          >
            <img
              v-if="typeof productRowPromo(section)?.config.image_url === 'string' && productRowPromo(section)?.config.image_url"
              class="product-row-promo-image"
              :src="String(productRowPromo(section)?.config.image_url)"
              alt=""
              loading="lazy"
            />
            <div class="product-row-promo-copy">
              <p class="product-row-promo-kicker" :style="{ color: promotionColor(productRowPromo(section)!, 'text_color', '#FFFFFF') }">Kisaku Supply Agencies</p>
              <h3 :style="{ color: promotionColor(productRowPromo(section)!, 'text_color', '#FFFFFF') }">
                {{ productRowPromo(section)?.title || 'Everyday essentials' }}
              </h3>
              <p :style="{ color: promotionColor(productRowPromo(section)!, 'text_color', '#FFFFFF') }">
                {{ productRowPromo(section)?.config.text }}
              </p>
              <a
                class="product-row-promo-link"
                :href="promotionLink(productRowPromo(section)?.config.link_url)"
                :target="isExternalLink(promotionLink(productRowPromo(section)?.config.link_url)) ? '_blank' : undefined"
                :rel="isExternalLink(promotionLink(productRowPromo(section)?.config.link_url)) ? 'noopener noreferrer' : undefined"
                :style="{ color: promotionColor(productRowPromo(section)!, 'text_color', '#FFFFFF') }"
              >
                {{ productRowPromo(section)?.config.button_label || 'Explore products' }} <ArrowRight :size="16" />
              </a>
            </div>
            <ShoppingBag v-if="!productRowPromo(section)?.config.image_url" class="product-row-promo-art" :size="92" stroke-width="1" aria-hidden="true" />
          </aside>
        </div>
        <p v-else class="extra-message">No products are available in this section yet.</p>
      </template>

      <article
        v-else-if="section.type === 'promo'"
        class="promo-section"
        :style="{
          backgroundColor: promotionColor(section, 'background_color', '#F0F7FC'),
          color: promotionColor(section, 'text_color', '#102A43'),
        }"
      >
        <img v-if="typeof section.config.image_url === 'string' && section.config.image_url" :src="section.config.image_url" alt="" loading="lazy" />
        <div>
          <h2 :style="{ color: promotionColor(section, 'text_color', '#102A43') }">
            {{ section.title || 'A special offer' }}
          </h2>
          <p :style="{ color: promotionColor(section, 'text_color', '#102A43') }">{{ section.config.text }}</p>
          <a
            :href="promotionLink(section.config.link_url)"
            :target="isExternalLink(promotionLink(section.config.link_url)) ? '_blank' : undefined"
            :rel="isExternalLink(promotionLink(section.config.link_url)) ? 'noopener noreferrer' : undefined"
            :style="{ color: promotionColor(section, 'text_color', '#102A43') }"
          >
            {{ section.config.button_label || 'Shop now' }} <ArrowRight :size="16" />
          </a>
        </div>
      </article>

      <section v-else-if="section.type === 'rich_text'" class="text-section">
        <h2 v-if="section.title">{{ section.title }}</h2>
        <p v-for="(paragraph, index) in String(section.config.body || '').split(/\n\s*\n/)" :key="index">{{ paragraph }}</p>
      </section>

      <section v-else-if="section.type === 'feature_list'" class="features-section">
        <h2 v-if="section.title">{{ section.title }}</h2>
        <ul>
          <li v-for="(feature, index) in featureItems(section)" :key="`${feature.title}-${index}`">
            <span v-if="feature.icon" class="feature-icon" aria-hidden="true">{{ feature.icon }}</span>
            <span><strong>{{ feature.title }}</strong><small v-if="feature.text">{{ feature.text }}</small></span>
          </li>
        </ul>
      </section>
    </section>
  </div>
</template>

<style scoped>
.storefront-extra-sections {
  display: grid;
  gap: 24px;
  width: min(1240px, calc(100% - 40px));
  margin: 0 auto 36px;
}

.storefront-extra-section,
.text-section,
.features-section {
  min-width: 0;
  padding: clamp(18px, 3vw, 28px);
  border: 1px solid #e5eaf0;
  border-radius: 9px;
  background: #fff;
}

.extra-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.extra-heading h2,
.text-section h2,
.features-section h2,
.promo-section h2 {
  margin: 0;
  color: #102a43;
  font-size: clamp(1.05rem, 2vw, 1.4rem);
}

.extra-link,
.promo-section a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #075397;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.banner-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 12px;
}

.banner-item {
  overflow: hidden;
  border-radius: 7px;
}

.banner-item img {
  display: block;
  width: 100%;
  height: 190px;
  object-fit: cover;
}

.banner-controls {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgb(255 255 255 / 94%);
  color: #17324d;
  font-size: 0.75rem;
}

.banner-controls button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #075397;
  color: #fff;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
}

.storefront-product-row-section {
  padding: 0;
  border: 0;
  background: transparent;
}

.product-row-eyebrow {
  margin: 0 0 5px;
  color: #647b92;
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.featured-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
}

.featured-layout.has-product-row-promo {
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 14px;
}

.extra-product-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.extra-product-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 180ms ease, transform 180ms ease;
}

.extra-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 17px rgb(16 42 67 / 10%);
}

.extra-product-media {
  position: relative;
  display: flex;
  width: 100%;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f7f8fa;
}

.extra-product-media > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 180ms ease;
}

.extra-product-card:hover .extra-product-media > img {
  transform: scale(1.035);
}

.extra-product-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  place-items: center;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 0.72rem;
}

.extra-stock-badge,
.extra-sale-badge {
  position: absolute;
  z-index: 1;
  top: 7px;
  left: 7px;
  padding: 4px 6px;
  border-radius: 4px;
  background: #e52429;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 750;
  line-height: 1;
}

.extra-stock-badge {
  background: #fff;
  color: #64748b;
}

.extra-wishlist-toggle {
  position: absolute;
  z-index: 2;
  top: 7px;
  right: 7px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: rgb(255 255 255 / 94%);
  color: #155da5;
  cursor: pointer;
}

.extra-wishlist-toggle.saved {
  color: #e11d48;
}

.extra-product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 9px;
}

.extra-product-title {
  display: -webkit-box;
  min-height: 0;
  overflow: hidden;
  color: #1c344f;
  font-size: 0.77rem;
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.extra-product-title:hover {
  color: #075397;
}

.extra-product-category {
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #465568;
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.extra-product-prices {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  margin-top: 7px;
}

.extra-product-prices strong {
  color: #101820;
  font-size: 0.88rem;
}

.extra-product-prices del {
  color: #64748b;
  font-size: 0.68rem;
}

.extra-product-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 5px 0 8px;
  color: #f59e0b;
  font-size: 0.72rem;
  font-weight: 650;
}

.extra-review-count {
  color: #6b7280;
  font-weight: 400;
}

.extra-add-to-cart {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
  padding: 8px 6px;
  border: 0;
  border-radius: 7px;
  background: #f58216;
  color: #fff;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;
}

.extra-add-to-cart:hover:not(:disabled) {
  background: #e97308;
}

.extra-add-to-cart.added {
  background: #e97308;
}

.extra-add-to-cart:disabled {
  background: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

.product-row-promo {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  padding: 22px 18px;
  border-radius: 8px;
  background: #102c49;
  color: #fff;
}

.product-row-promo-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  inset: 0;
}

.product-row-promo-copy {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 220px;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
}

.product-row-promo.has-promo-image::before {
  position: absolute;
  z-index: 0;
  background: linear-gradient(180deg, rgb(8 28 48 / 80%), rgb(8 28 48 / 65%));
  content: '';
  inset: 0;
}

.product-row-promo-kicker {
  position: relative;
  z-index: 1;
  margin: 0 0 14px;
  color: #ffbd76;
  font-size: 0.69rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-row-promo h3 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.35rem;
  font-weight: 750;
  line-height: 1.25;
}

.product-row-promo-copy > p:not(.product-row-promo-kicker) {
  position: relative;
  z-index: 1;
  margin: 12px 0 20px;
  color: #d3deea;
  font-size: 0.82rem;
  line-height: 1.55;
}

.product-row-promo-link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 750;
  text-decoration: none;
}

.product-row-promo-art {
  position: absolute;
  right: -18px;
  bottom: -16px;
  color: rgb(255 255 255 / 8%);
}

.promo-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.8fr);
  gap: 24px;
  align-items: center;
  padding: clamp(18px, 3vw, 32px);
  border-radius: 9px;
  background: #f0f7fc;
}

.promo-section > img {
  width: 100%;
  max-height: 280px;
  border-radius: 7px;
  object-fit: cover;
}

.promo-section p,
.text-section p {
  color: #526579;
  line-height: 1.7;
  white-space: pre-line;
}

.features-section ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.features-section li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #17324d;
}

.features-section li > span:last-child {
  display: grid;
  gap: 4px;
}

.features-section small {
  color: #64748b;
  line-height: 1.5;
}

.feature-icon {
  color: #075397;
  font-size: 0.75rem;
  font-weight: 700;
}

.extra-message {
  color: #64748b;
}

@media (max-width: 600px) {
  .storefront-extra-sections {
    width: calc(100% - 28px);
  }

  .featured-layout {
    grid-template-columns: 1fr;
  }

  .product-row-promo {
    min-height: 180px;
  }

  .promo-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1100px) {
  .featured-layout.has-product-row-promo {
    grid-template-columns: minmax(0, 1fr) 190px;
  }

  .extra-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .featured-layout,
  .featured-layout.has-product-row-promo {
    grid-template-columns: 1fr;
  }

  .extra-product-grid {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 1px 10px;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .extra-product-grid::-webkit-scrollbar {
    display: none;
  }

  .extra-product-card {
    flex: 0 0 43%;
    scroll-snap-align: start;
  }

  .product-row-promo {
    min-height: 160px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .extra-product-card,
  .extra-product-media > img {
    transition-duration: 0.01ms;
  }
}
</style>
