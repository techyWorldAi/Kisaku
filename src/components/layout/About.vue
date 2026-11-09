<script setup lang="ts">
defineProps<{
  storeName: string;
}>();

const values = [
  'Quality products selected with care',
  'Clear value and honest information',
  'Convenient shopping for customers across Kenya',
  'Helpful, dependable customer support',
];
</script>

<template>
  <main class="about-page">
    <header class="about-heading">
      <p class="about-eyebrow">{{ storeName }}</p>
      <h1>About us</h1>
      <p>Everyday essentials, thoughtfully selected for shoppers across Kenya.</p>
    </header>

    <section class="about-story about-mission" aria-labelledby="mission-heading">
      <h2 id="mission-heading">Our mission</h2>
      <div>
        <p>
          At {{ storeName }}, our mission is to make everyday shopping easier.
          We bring useful products together in one convenient place, with clear
          information and dependable service.
        </p>
        <p>
          From browsing to delivery, we aim to make finding the right essentials
          feel simple, straightforward, and reliable.
        </p>
      </div>
    </section>

    <section class="about-story about-vision" aria-labelledby="vision-heading">
      <h2 id="vision-heading">Our vision</h2>
      <div>
        <p>
          We want to be a trusted destination for quality everyday essentials,
          serving households and businesses across Kenya.
        </p>
        <p>
          We are building a shopping experience that brings convenience,
          thoughtful selection, and customer care together.
        </p>
      </div>
    </section>

    <section class="about-story about-values" aria-labelledby="values-heading">
      <h2 id="values-heading">Our values</h2>
      <ul>
        <li v-for="value in values" :key="value">{{ value }}</li>
      </ul>
    </section>

    <section class="about-cta">
      <div>
        <h2>Find what you need</h2>
        <p>Explore everyday essentials from {{ storeName }}.</p>
      </div>
      <router-link to="/shop" class="about-cta-link">
        Shop now <span aria-hidden="true">→</span>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  color: #172b3e;
}

.about-heading {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.about-eyebrow {
  margin: 0 0 12px;
  color: #155da5;
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-heading h1 {
  margin: 0;
  color: #102a43;
  font-size: clamp(2.4rem, 5vw, 3.5rem);
  font-weight: 500;
  letter-spacing: -0.045em;
}

.about-heading > p:last-child {
  max-width: 540px;
  margin: 14px 0 0;
  color: #5b6b7b;
  font-size: 1rem;
  line-height: 1.7;
}

.about-story {
  display: grid;
  grid-template-columns: minmax(170px, 0.7fr) minmax(0, 1.3fr);
  gap: clamp(28px, 8vw, 120px);
  align-items: start;
  padding: clamp(42px, 7vw, 78px) max(24px, calc((100% - 1120px) / 2));
}

.about-story h2 {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.about-story p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.8;
}

.about-story p + p {
  margin-top: 16px;
}

.about-mission {
  background: #1687c5;
  color: #fff;
}

.about-vision {
  position: relative;
  isolation: isolate;
  background: #183143 url('/bg.jpg') center 43% / cover no-repeat;
  color: #fff;
}

.about-vision::before {
  position: absolute;
  z-index: -1;
  background: rgb(8 24 34 / 66%);
  content: '';
  inset: 0;
}

.about-values {
  background: #fff;
}

.about-values h2 {
  color: #1687c5;
}

.about-values ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  color: #526170;
  list-style: none;
}

.about-values li::before {
  margin-right: 9px;
  color: #1687c5;
  content: '—';
}

.about-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 54px max(24px, calc((100% - 1120px) / 2));
  background: #f2f5f7;
}

.about-cta h2 {
  margin: 0;
  color: #102a43;
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  line-height: 1.2;
}

.about-cta p {
  margin: 8px 0 0;
  color: #5b6b7b;
}

.about-cta-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 18px;
  color: #102a43;
  font-size: 1.05rem;
  font-weight: 750;
  text-decoration: none;
}

.about-cta-link span {
  font-size: 2rem;
  font-weight: 400;
  transition: transform 160ms ease;
}

.about-cta-link:hover span {
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .about-heading {
    min-height: 220px;
  }

  .about-story {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .about-cta {
    align-items: flex-start;
    flex-direction: column;
    padding-top: 42px;
    padding-bottom: 42px;
  }
}
</style>
