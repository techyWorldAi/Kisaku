<template>
  <section class="hero-shell" aria-label="Shop Kisaku everyday essentials">
    <router-link to="/shop" class="hero-link" aria-label="Shop everyday essentials">
      <img
        src="/Kisaku Everyday Essentials Delivered.png"
        alt="Kisaku Supply Agencies: everyday products, great prices, delivered to you. Shop now."
        fetchpriority="high"
      />
    </router-link>
  </section>
</template>

<style scoped>
.hero-shell {
  width: min(1240px, calc(100% - 40px));
  margin: 18px auto 0;
  overflow: hidden;
  border-radius: 8px;
}

.hero-link {
  display: block;
}

.hero-link img {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 680px) {
  .hero-shell {
    width: calc(100% - 28px);
    margin-top: 12px;
    border-radius: 6px;
  }
}
</style>
