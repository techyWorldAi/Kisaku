<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { productAPI } from '../../services/api';
import type { Product } from '../../services/api';

const products = ref<Product[]>([]);
const loading = ref(true);
const loadError = ref(false);
const router = useRouter();

async function fetchProducts() {
  loading.value = true;
  loadError.value = false;

  try {
    const data = await productAPI.getPublicProducts();
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    products.value = [];
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function goToDetails(id: number) {
  void router.push(`/product/${id}`);
}

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-3xl font-semibold mb-6">Shop</h1>
    <p v-if="loading" class="py-8 text-center text-gray-600">Loading products...</p>
    <div v-else-if="loadError" class="py-8 text-center text-red-600" role="alert">
      Products are temporarily unavailable. Please try again.
      <button type="button" class="ml-2 underline" @click="fetchProducts">Retry</button>
    </div>
    <p v-else-if="products.length === 0" class="py-8 text-center text-gray-600">No products available.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="goToDetails(product.id)"
      >
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-48 object-cover mb-4 rounded"
        />
        <h2 class="text-xl font-medium mb-2">{{ product.name }}</h2>
        <p class="text-gray-700 mb-2 truncate">{{ product.description }}</p>
        <p class="font-semibold text-yellow-600">${{ product.price.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>
