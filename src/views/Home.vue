<script setup lang="ts">
import Hero from '../components/layout/Hero.vue'
import Header from '../components/layout/Menu.vue'
import Product from '../components/product/ProductList.vue'
</script>

<template>
  <div class="home-page">
    <Header />
    <Hero />
    <Product />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
}
</style>