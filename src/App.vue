<script setup lang="ts">
// import Shop from './components/Shop.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Footer from './components/layout/Footer.vue';

const route = useRoute();
const hideFooter = computed(() => (
  route.path === '/login'
  || route.path === '/signup'
  || route.path.startsWith('/vendor')
  || route.path.startsWith('/admin')
));
</script>

<template>
  <router-view />
  <Footer v-if="!hideFooter" />
</template>
