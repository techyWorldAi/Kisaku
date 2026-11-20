<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Check,
  Eye,
  Gem,
  Headset,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Target,
  Truck,
} from 'lucide-vue-next';

defineProps<{ storeName: string }>();

const reasons = [
  'Wide range of products',
  'Secure and easy checkout',
  'Timely delivery',
  'Responsive customer support',
];

const promises = [
  { title: 'Trusted & Reliable', description: 'Shop with confidence.', icon: ShieldCheck },
  { title: 'Fast & Efficient', description: 'Prompt delivery across Kenya.', icon: Truck },
  { title: 'Great Value', description: 'Quality products at competitive prices.', icon: Gem },
  { title: 'Dedicated Support', description: 'We are here to help.', icon: Headset },
];

const principles = [
  {
    title: 'Our Mission',
    description: 'To provide high-quality products and exceptional service, making shopping easy and reliable for everyone in Kenya.',
    icon: Target,
    tone: 'mission',
  },
  {
    title: 'Our Vision',
    description: "To be Kenya's most trusted and preferred online supply store.",
    icon: Eye,
    tone: 'vision',
  },
  {
    title: 'Our Values',
    description: 'Integrity, Customer Focus, Innovation and Excellence.',
    icon: Gem,
    tone: 'values',
  },
];
</script>

<template>
  <main class="about-page">
    <header class="about-hero">
      <div class="about-hero-inner">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <router-link to="/">Home</router-link><span aria-hidden="true">›</span><span>About Us</span>
        </nav>
        <h1>About {{ storeName.replace(' Supply Agencies', '') }}</h1>
        <p>Your Trusted Supply Partner in Kenya</p>
        <span class="orange-rule" aria-hidden="true"></span>
      </div>
    </header>

    <div class="about-content">
      <section class="story-section" aria-labelledby="story-title">
        <div class="story-copy">
          <p class="section-kicker"><span></span> Our Story</p>
          <h2 id="story-title">Building a Smarter Shopping Experience</h2>
          <p>
            {{ storeName }} is a trusted supplier of quality products in Kenya.
            We are committed to offering reliable products, competitive prices
            and excellent service to individuals, businesses and organisations.
          </p>
          <p>
            Our online platform makes it easier for you to shop from anywhere,
            at any time, with confidence.
          </p>
          <router-link to="/shop" class="shop-link">Shop with Us <ArrowRight :size="16" /></router-link>
        </div>

        <ul class="promise-list" aria-label="What you can expect">
          <li v-for="promise in promises" :key="promise.title">
            <span class="promise-icon"><component :is="promise.icon" :size="25" aria-hidden="true" /></span>
            <span><strong>{{ promise.title }}</strong><small>{{ promise.description }}</small></span>
          </li>
        </ul>
      </section>

      <section class="stats-strip" aria-label="Kisaku at a glance">
        <div class="stat-item">
          <ShoppingBag :size="30" aria-hidden="true" />
          <span><strong>10K+</strong><small>Happy Customers</small></span>
        </div>
        <div class="stat-item">
          <Box :size="30" aria-hidden="true" />
          <span><strong>5K+</strong><small>Products Available</small></span>
        </div>
        <div class="stat-item">
          <BadgeCheck :size="30" aria-hidden="true" />
          <span><strong>100%</strong><small>Customer Satisfaction</small></span>
        </div>
        <div class="stat-item">
          <MapPin :size="30" aria-hidden="true" />
          <span><strong>Kenya</strong><small>Serving Across Kenya</small></span>
        </div>
      </section>

      <section class="principles-grid" aria-label="Our purpose and values">
        <article v-for="principle in principles" :key="principle.title" class="principle-card" :class="principle.tone">
          <component :is="principle.icon" :size="42" stroke-width="1.8" aria-hidden="true" />
          <div>
            <h2>{{ principle.title }}</h2>
            <p>{{ principle.description }}</p>
          </div>
        </article>
      </section>

      <section class="why-section" aria-labelledby="why-title">
        <div class="why-copy">
          <p class="section-kicker"><span></span> Why Choose {{ storeName.replace(' Supply Agencies', '') }}?</p>
          <h2 id="why-title">More Than Just a Store</h2>
          <p>
            We are dedicated to delivering a seamless shopping experience,
            backed by reliable service and a commitment to our customers.
          </p>
        </div>
        <ul class="reason-list">
          <li v-for="reason in reasons" :key="reason"><span><Check :size="13" /></span>{{ reason }}</li>
        </ul>
        <img
          class="why-image"
          src="/p3.jpg"
          alt="A colourful woven basket from the Kisaku product range"
          loading="lazy"
        >
      </section>

      <section class="about-cta">
        <div class="cta-mark"><ShoppingBag :size="35" aria-hidden="true" /></div>
        <div class="cta-copy">
          <h2>Shop Smart. Shop {{ storeName.replace(' Supply Agencies', '') }}.</h2>
          <p>Quality products, better living.</p>
        </div>
        <router-link to="/shop">Start Shopping <ArrowRight :size="17" /></router-link>
      </section>
    </div>
  </main>
</template>

<style scoped>
.about-page{color:#102c49}.about-hero{position:relative;isolation:isolate;min-height:145px;overflow:hidden;background:linear-gradient(105deg,#064b94,#125da4 52%,#0a3767)}.about-hero::before{position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(5,51,103,.95) 0%,rgba(5,68,132,.72) 48%,rgba(5,57,109,.08) 100%),url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1800&q=85') center 53%/cover no-repeat;content:''}.about-hero-inner{width:min(1240px,calc(100% - 40px));margin:0 auto;padding:18px 8px 19px;color:#fff}.breadcrumbs{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:.73rem}.breadcrumbs a{color:#fff;text-decoration:none}.breadcrumbs a:hover{text-decoration:underline}.breadcrumbs span:last-child{opacity:.9}.about-hero h1{margin:0;font-size:clamp(2rem,4.6vw,2.7rem);font-weight:750;letter-spacing:-.03em}.about-hero p{margin:1px 0 0;font-size:1.04rem;font-weight:650}.orange-rule{display:block;width:54px;height:4px;margin-top:8px;background:#ff7900}.about-content{width:min(1240px,calc(100% - 40px));margin:0 auto}.story-section{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);align-items:center;gap:30px;padding:22px 14px 18px}.section-kicker{display:flex;align-items:center;gap:7px;margin:0 0 7px;color:#075397;font-size:.76rem;font-weight:750}.section-kicker>span{width:20px;height:3px;background:#ff7900}.story-copy h2,.why-copy h2{margin:0 0 8px;color:#102c49;font-size:clamp(1.35rem,2.6vw,1.75rem);font-weight:750;line-height:1.12;letter-spacing:-.025em}.story-copy>p:not(.section-kicker),.why-copy>p:not(.section-kicker){margin:0 0 9px;color:#354f69;font-size:.79rem;line-height:1.6}.shop-link{display:inline-flex;align-items:center;gap:8px;margin-top:4px;padding:8px 14px;border-radius:999px;background:#ff7900;color:#fff;font-size:.76rem;font-weight:750;text-decoration:none}.shop-link:hover{background:#e76d00}.promise-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}.promise-list li{display:flex;align-items:center;gap:12px}.promise-icon{display:grid;width:48px;height:48px;flex:0 0 48px;place-items:center;border-radius:50%;background:#e8f1ff;color:#075397}.promise-list li>span:last-child{display:grid;gap:3px}.promise-list strong{font-size:.77rem;font-weight:750}.promise-list small{color:#526579;font-size:.7rem;line-height:1.35}.stats-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:0 0 14px;padding:14px 10px;border-radius:10px;background:linear-gradient(105deg,#e1efff,#d9eaff)}.stat-item{display:flex;align-items:center;justify-content:center;gap:12px;color:#ff7900}.stat-item+.stat-item{border-left:1px solid #8eacd0}.stat-item>span{display:grid;gap:1px;color:#102c49}.stat-item strong{font-size:1.35rem;font-weight:800;line-height:1}.stat-item small{font-size:.68rem}.principles-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 15px}.principle-card{display:flex;min-height:92px;align-items:center;gap:16px;padding:14px;border:1px solid #dfe7ef;border-radius:11px;background:#fff}.principle-card>svg{flex:0 0 auto;color:#075397}.principle-card.vision>svg{color:#075397}.principle-card.values>svg{color:#155da5}.principle-card h2{margin:0 0 4px;font-size:.8rem;font-weight:750}.principle-card p{margin:0;color:#435b72;font-size:.68rem;line-height:1.45}.why-section{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.75fr) minmax(0,1.15fr);align-items:center;gap:25px;padding:3px 4px 16px}.why-copy h2{font-size:1.55rem}.reason-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.reason-list li{display:flex;align-items:center;gap:8px;color:#173b62;font-size:.76rem}.reason-list li span{display:grid;width:17px;height:17px;flex:0 0 17px;place-items:center;border-radius:50%;background:#ff7900;color:#fff}.why-image{display:block;width:100%;height:126px;border-radius:9px;object-fit:cover;object-position:center 50%;background:#e7edf4}.about-cta{position:relative;isolation:isolate;display:flex;min-height:78px;align-items:center;gap:18px;overflow:hidden;margin:0 -7px 16px;padding:12px 24px;border-radius:13px;background:linear-gradient(105deg,#06488f 0%,#0b5aa5 58%,#103568 100%);color:#fff}.about-cta::after{position:absolute;z-index:-1;top:-50px;right:26%;width:110px;height:180px;transform:rotate(32deg);background:linear-gradient(90deg,#ff7900,#f6a14e);content:''}.cta-mark{display:grid;width:42px;height:42px;flex:0 0 42px;place-items:center;color:#ff7900}.cta-copy h2{margin:0;font-size:1.15rem;font-weight:750}.cta-copy p{margin:2px 0 0;font-size:.78rem}.about-cta>a{display:flex;min-height:38px;align-items:center;gap:8px;margin-left:auto;padding:0 16px;border-radius:999px;background:#ff7900;color:#fff;font-size:.76rem;font-weight:750;text-decoration:none;white-space:nowrap}.about-cta>a:hover{background:#e76d00}
@media(max-width:850px){.story-section{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}.promise-list{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}.why-section{grid-template-columns:1fr 1fr}.why-image{grid-column:1/-1;height:180px}.principle-card{gap:10px;padding:12px}.principle-card>svg{width:34px}}
@media(max-width:560px){.about-hero-inner,.about-content{width:calc(100% - 28px)}.about-hero{min-height:150px}.about-hero-inner{padding:18px 0}.about-hero h1{font-size:2rem}.about-hero p{font-size:.9rem}.story-section{grid-template-columns:1fr;padding:20px 2px 14px}.story-copy h2{font-size:1.55rem}.promise-list{grid-column:auto;grid-template-columns:1fr 1fr;gap:12px 8px}.promise-list li{align-items:flex-start;gap:8px}.promise-icon{width:38px;height:38px;flex-basis:38px}.promise-icon svg{width:20px}.promise-list strong{font-size:.71rem}.promise-list small{font-size:.65rem}.stats-strip{grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin-bottom:12px;padding:10px 6px}.stat-item{justify-content:flex-start;padding:10px}.stat-item:nth-child(3){border-left:0}.stat-item:nth-child(n+3){border-top:1px solid #8eacd0}.stat-item strong{font-size:1.2rem}.stat-item small{font-size:.63rem}.principles-grid{grid-template-columns:1fr;gap:8px}.principle-card{min-height:78px}.why-section{grid-template-columns:1fr;gap:12px;padding:4px 2px 14px}.why-image{grid-column:auto;height:180px}.about-cta{flex-wrap:wrap;gap:9px;padding:14px}.cta-mark{width:34px;flex-basis:34px}.cta-copy{flex:1}.cta-copy h2{font-size:1rem}.about-cta>a{width:100%;justify-content:center;margin-left:0}.about-cta::after{right:10%;opacity:.55}}
</style>
