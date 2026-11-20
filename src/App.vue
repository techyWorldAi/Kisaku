<script setup lang="ts">
// import Shop from './components/Shop.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Footer from './components/layout/Footer.vue';

const route = useRoute();
const hideFooter = computed(() => (
  route.path === '/login'
  || route.path === '/signup'
  || ['/', '/shop', '/about', '/contact', '/privacy-policy', '/terms'].includes(route.path)
  || route.path.startsWith('/vendor')
  || route.path.startsWith('/admin')
));
</script>

<template>
  <router-view />
  <Footer v-if="!hideFooter" />
</template>
