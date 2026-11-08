import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

function storageKey(userId: number | undefined) {
  return `kisakuWishlist-${userId ?? 'guest'}`;
}

function readWishlist(key: string): number[] {
  const saved = localStorage.getItem(key);
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((id) => Number.isInteger(id))) {
      throw new Error('Stored wishlist must be an array of product IDs.');
    }
    return parsed as number[];
  } catch (error) {
    console.error('Could not read the saved wishlist:', error);
    return [];
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const authStore = useAuthStore();
  const currentKey = ref(storageKey(authStore.user?.id));
  const productIds = ref(readWishlist(currentKey.value));
  const count = computed(() => productIds.value.length);

  watch(
    () => authStore.user?.id,
    (userId) => {
      currentKey.value = storageKey(userId);
      productIds.value = readWishlist(currentKey.value);
    },
  );

  function isSaved(productId: number) {
    return productIds.value.includes(productId);
  }

  function toggle(productId: number) {
    productIds.value = isSaved(productId)
      ? productIds.value.filter((id) => id !== productId)
      : [...productIds.value, productId];
    localStorage.setItem(currentKey.value, JSON.stringify(productIds.value));
  }

  function removeMissingProducts(validIds: Set<number>) {
    const existing = productIds.value.filter((id) => validIds.has(id));
    if (existing.length !== productIds.value.length) {
      productIds.value = existing;
      localStorage.setItem(currentKey.value, JSON.stringify(existing));
    }
  }

  return { productIds, count, isSaved, toggle, removeMissingProducts };
});
