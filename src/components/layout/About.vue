<script setup lang="ts">
import { ref, onMounted } from 'vue';
import African from '/Africanshirt.webp';

const imageVisible = ref(false);
const textVisible = ref(false);

function observeElement(el: Element | null, callback: () => void) {
  if (!el) return;
  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  observer.observe(el);
}

onMounted(() => {
  observeElement(document.querySelector('#image'), () => {
    imageVisible.value = true;
  });
  observeElement(document.querySelector('#text'), () => {
    textVisible.value = true;
  });
});
</script>
<template>
  
  <section class="max-w-7xl mx-auto px-6 py-20 md:py-32">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <!-- Image side -->
      <div
        id="image"
        :class="{
          'opacity-0 translate-x-[-20px]': !imageVisible,
          'opacity-100 translate-x-0 transition duration-1000 ease-out': imageVisible,
        }"
      >
        <img
          :src="African"
          alt="Luxury African Wear"
          class=" shadow-lg object-cover w-full h-[400px] md:h-[500px]"
        />
      </div>

      <!-- Text side -->
      <div
        id="text"
        :class="{
          'opacity-0 translate-x-[20px]': !textVisible,
          'opacity-100 translate-x-0 transition duration-1000 ease-out delay-300': textVisible,
        }"
        class="space-y-8"
      >
        <h2 class="text-4xl font-extrabold tracking-tight text-gray-900 font-serif">
          About <span class="text-yellow-500">T-Shop</span>
        </h2>
        <p class="text-lg text-gray-700 leading-relaxed">
          At <strong>T-Shop</strong>, we celebrate the rich heritage and exquisite craftsmanship of African fashion. Our curated collection of luxury African wear merges traditional designs with contemporary elegance, offering you timeless pieces that tell a story.
        </p>
        <p class="text-lg text-gray-700 leading-relaxed">
          Each garment is meticulously crafted by skilled artisans using premium materials, ensuring not only beauty but comfort and quality. Whether you’re dressing for a special occasion or everyday elegance, our pieces empower you to express your unique style.
        </p>
        <p class="text-lg text-gray-700 leading-relaxed">
          Join us in honoring African culture and luxury. Discover the essence of true craftsmanship with T-Shop.
        </p>

        <router-link
          to="/shop"
          class="inline-block bg-yellow-500 hover:bg-yellow-600 transition text-white font-semibold px-8 py-3 rounded shadow-lg tracking-wide font-serif"
        >
          Shop Our Collection
        </router-link>
      </div>
    </div>
  </section>
</template>
