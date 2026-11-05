<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const products = ref<Product[]>([]);
const router = useRouter();

async function fetchProducts() {
  try {
    const res = await fetch('http://localhost:8080/api/products'); // your backend endpoint
    products.value = await res.json();
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
}

function goToDetails(id: number) {
  router.push(`/shop/${id}`);
}

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-3xl font-semibold mb-6">Shop</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="goToDetails(product.id)"
      >
        <img
          :src="product.image"
          alt="product.name"
          class="w-full h-48 object-cover mb-4 rounded"
        />
        <h2 class="text-xl font-medium mb-2">{{ product.name }}</h2>
        <p class="text-gray-700 mb-2 truncate">{{ product.description }}</p>
        <p class="font-semibold text-yellow-600">${{ product.price.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>
