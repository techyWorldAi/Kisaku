<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  CarFront,
  Heart,
  House,
  MonitorSmartphone,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
} from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { productAPI, storefrontAPI } from '../../services/api';
import type { Category, Product, StorefrontSection } from '../../services/api';

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
const categorySection = ref<StorefrontSection | null>(null);
const props = defineProps<{
  preview?: boolean;
  previewCategorySection?: StorefrontSection | null;
  showProducts?: boolean;
}>();
const loading = ref(true);
const loadError = ref(false);
const unavailableImages = ref(new Set<number>());
const unavailableCategoryImages = ref(new Set<string>());
const addedProductId = ref<number | null>(null);
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;

const categoryHeading = computed(() => ({
  title: typeof categorySection.value?.title === 'string' && categorySection.value.title.trim()
    ? categorySection.value.title
    : 'Shop by category',
}));

const categoryCards = computed(() => {
  const limit = categorySection.value?.config.limit;
  const visibleCategories = categories.value.length
    ? categories.value.slice(0, typeof limit === 'number' && limit > 0 ? limit : categories.value.length)
    : categoryDefinitions.map((definition, index) => ({
      id: -(index + 1),
      name: definition.label,
      definition,
    }));

  return visibleCategories.map((category) => {
    const matchedDefinition = 'definition' in category
      ? category.definition
      : categoryDefinitions.find((definition) => definition.keys.some((key) => category.name.toLowerCase().includes(key)));

    return {
      id: category.id > 0 ? category.id : undefined,
      name: category.name,
      description: 'description' in category ? category.description : '',
      image: ('image_url' in category && typeof category.image_url === 'string' && category.image_url)
        || matchedDefinition?.image
        || '',
      icon: matchedDefinition?.icon ?? ShoppingBag,
      href: category.id > 0 ? `/shop?category=${category.id}` : '/shop',
      external: false,
    };
  });
});

const featuredProducts = computed(() => [...products.value]
  .sort((a, b) => {
    const timeA = Date.parse(a.created_at ?? '');
    const timeB = Date.parse(b.created_at ?? '');
    if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  })
  .slice(0, 5));

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

function toggleWishlist(product: Product) {
  if (!authStore.isAuthenticated) {
    void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  wishlistStore.toggle(product.id);
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

async function fetchCategorySection() {
  if (props.preview) {
    categorySection.value = props.previewCategorySection ?? null;
    return;
  }

  try {
    const storefront = await storefrontAPI.getPublished();
    categorySection.value = storefront.sections.find((section) => section.section_key === 'categories') ?? null;
  } catch (error) {
    console.error('Failed to load published category display settings:', error);
  }
}

onMounted(() => {
  void fetchProducts();
  void fetchCategories();
  void fetchCategorySection();
});
</script>

<template>
  <main class="catalog-shell">
    <section v-if="categorySection?.is_visible !== false" id="categories" class="catalog-section">
      <header class="section-heading">
        <div>
          <h2><span class="desktop-section-title">{{ categoryHeading.title }}</span><span class="mobile-section-title">{{ categoryHeading.title }}</span></h2>
        </div>
        <router-link to="/shop" class="section-link">
          Browse all <ArrowRight :size="16" />
        </router-link>
      </header>

      <div class="category-grid">
        <component
          :is="category.external ? 'a' : 'router-link'"
          v-for="category in categoryCards"
          :key="category.id ?? category.name"
          :to="category.external ? undefined : category.href"
          :href="category.external ? category.href : undefined"
          :target="category.external ? '_blank' : undefined"
          :rel="category.external ? 'noopener noreferrer' : undefined"
          class="category-card"
        >
          <img
            v-if="category.image && !unavailableCategoryImages.has(category.name)"
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
            <small v-if="categorySection?.config.show_descriptions === true && category.description">{{ category.description }}</small>
            <ArrowRight :size="16" aria-hidden="true" />
          </span>
        </component>
      </div>
    </section>

    <section v-if="props.showProducts !== false" id="featured" class="catalog-section product-section">
      <header class="section-heading">
        <div>
          <p class="eyebrow">Recently added to our live catalogue</p>
          <h2><span class="desktop-section-title">New arrivals</span><span class="mobile-section-title">New arrivals</span></h2>
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
                <span v-if="discountPercentage(product) > 0" class="sale-badge">
                  -{{ discountPercentage(product) }}%
                </span>
              </router-link>
              <button
                type="button"
                class="wishlist-toggle"
                :class="{ saved: wishlistStore.isSaved(product.id) }"
                :aria-label="wishlistStore.isSaved(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
                :aria-pressed="wishlistStore.isSaved(product.id)"
                @click="toggleWishlist(product)"
              >
                <Heart :size="17" :fill="wishlistStore.isSaved(product.id) ? 'currentColor' : 'none'" />
              </button>

              <div class="product-info">
                <router-link :to="`/product/${product.id}`" class="product-title">
                  {{ product.name }}
                </router-link>
                <span v-if="getProductCategory(product)" class="product-category">
                  {{ getProductCategory(product) }}
                </span>
                <div class="product-price-row">
                  <p class="product-price">KSh {{ Number(product.price).toLocaleString() }}</p>
                  <del v-if="discountPercentage(product) > 0" class="product-original-price">
                    KSh {{ Number(product.original_price).toLocaleString() }}
                  </del>
                </div>
                <div v-if="getProductRating(product) !== null" class="product-rating">
                  <Star :size="12" fill="currentColor" aria-hidden="true" />
                  <span>{{ getProductRating(product)?.toFixed(1) }}</span>
                  <span v-if="getProductReviewCount(product) !== null" class="product-review-count">
                    ({{ getProductReviewCount(product)?.toLocaleString() }})
                  </span>
                </div>
                <div class="product-action-row product-card-actions">
                  <button
                    class="product-action product-action-cart"
                    :class="{ added: addedProductId === product.id }"
                    :disabled="product.stock <= 0"
                    type="button"
                    @click="addToCart(product)"
                  >
                    <ShoppingCart :size="14" aria-hidden="true" />
                    {{ addedProductId === product.id ? 'Added to Cart' : 'Add to Cart' }}
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

.mobile-section-title {
  display: none;
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

.section-link:hover {
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
  display: block;
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
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 6px;
  background: #fff;
  transition: box-shadow 180ms ease, transform 180ms ease;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgb(16 44 73 / 12%);
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

.wishlist-toggle {
  position: absolute;
  z-index: 2;
  top: 7px;
  right: 7px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: rgb(255 255 255 / 94%);
  color: #155da5;
  cursor: pointer;
}

.wishlist-toggle.saved {
  color: #e11d48;
}

.wishlist-toggle:hover {
  transform: scale(1.06);
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
  padding: 9px;
}

.product-title {
  display: -webkit-box;
  min-height: 0;
  overflow: hidden;
  color: #1f2937;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.4;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.product-title:hover {
  color: #111827;
}

.product-category {
  width: fit-content;
  max-width: 100%;
  margin: 5px 0 0;
  overflow: hidden;
  padding: 3px 7px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.64rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin: 5px 0 0;
  color: #111827;
  font-size: 0.82rem;
  font-weight: 750;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-original-price {
  color: #6b7280;
  font-size: 0.65rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 3px 0 7px;
  color: #f59e0b;
  font-size: 0.68rem;
  font-weight: 650;
}

.product-review-count {
  color: #6b7280;
  font-weight: 400;
}

.sale-badge {
  position: absolute;
  z-index: 1;
  top: 6px;
  left: 6px;
  padding: 3px 5px;
  border-radius: 4px;
  background: #e52429;
  color: #fff;
  font-size: 0.63rem;
  font-weight: 750;
  line-height: 1;
}

.product-card-actions {
  grid-template-columns: minmax(0, 1fr);
  margin-top: 5px;
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

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

}

@media (max-width: 760px) {
  .catalog-shell {
    width: calc(100% - 28px);
    padding: 20px 0 28px;
  }

  .product-grid {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 1px 10px;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .product-card,
  .product-skeleton {
    flex: 0 0 43%;
    scroll-snap-align: start;
  }

  .catalog-section + .catalog-section {
    margin-top: 24px;
  }

  .category-grid {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 1px 8px;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }

  .category-grid::-webkit-scrollbar,
  .product-grid::-webkit-scrollbar {
    display: none;
  }

  .category-card {
    min-height: 94px;
    flex: 0 0 82px;
    align-items: center;
    justify-content: center;
    border: 1px solid #edf0f3;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgb(16 42 67 / 5%);
    color: #334155;
    scroll-snap-align: start;
  }

  .category-image,
  .category-overlay {
    display: none;
  }

  .category-content {
    flex-direction: column;
    gap: 7px;
    padding: 9px 5px;
    text-align: center;
    font-size: 0.65rem;
  }

  .category-content > :last-child {
    display: none;
  }

  .category-content > :first-child {
    width: 25px;
    height: 25px;
    color: #155da5;
  }

  .category-content span {
    display: -webkit-box;
    overflow: hidden;
    line-height: 1.2;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

}

@media (max-width: 560px) {
  .section-heading {
    align-items: flex-start;
    margin-bottom: 13px;
  }

  .section-heading h2 {
    font-size: 1.05rem;
  }

  .desktop-section-title {
    display: none;
  }

  .mobile-section-title {
    display: inline;
  }

  .section-link {
    padding-top: 4px;
    font-size: 0.7rem;
  }

  .eyebrow {
    margin-bottom: 3px;
    font-size: 0.62rem;
  }

  .product-card,
  .product-skeleton {
    border: 1px solid #edf0f3;
    border-radius: 11px;
    box-shadow: 0 2px 10px rgb(16 42 67 / 6%);
  }

  .product-media {
    aspect-ratio: 1 / 0.9;
  }

  .product-info {
    padding: 8px;
  }

  .product-title {
    min-height: 34px;
    font-size: 0.72rem;
  }

  .product-price {
    font-size: 0.78rem;
  }

  .product-category {
    max-width: 100%;
    font-size: 0.6rem;
  }

  .product-rating {
    display: flex;
    gap: 2px;
    margin: 3px 0 6px;
    font-size: 0.61rem;
  }

  .product-card-actions .product-action {
    min-height: 38px;
    gap: 4px;
    padding: 6px 4px;
    font-size: 0.62rem;
  }

  .add-button {
    min-height: 40px;
    font-size: 0.73rem;
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
