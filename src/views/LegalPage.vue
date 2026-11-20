<script setup lang="ts">
import { computed } from 'vue';
import {
  ClipboardList,
  Mail,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UsersRound,
} from 'lucide-vue-next';
import Header from '../components/layout/Menu.vue';
import StorefrontFooter from '../components/storefront/StorefrontFooter.vue';

const props = defineProps<{ kind: 'privacy' | 'terms' }>();

const isPrivacy = computed(() => props.kind === 'privacy');
const title = computed(() => isPrivacy.value ? 'Privacy Policy' : 'Terms of Service');
const subtitle = computed(() => isPrivacy.value
  ? 'Your privacy is important to us.'
  : 'By using our website, you agree to these terms.');

const sections = computed(() => isPrivacy.value
  ? [
      {
        title: 'Information We Collect',
        icon: UsersRound,
        paragraphs: ['We may collect personal information such as your name, email address, phone number, delivery address and payment details when you create an account, place an order or contact us.'],
      },
      {
        title: 'How We Use Your Information',
        icon: ClipboardList,
        paragraphs: ['Your information helps us process and deliver orders, provide customer support, improve our products and services, and communicate with you about your account, orders and offers.'],
      },
      {
        title: 'How We Protect Your Information',
        icon: ShieldCheck,
        paragraphs: ['We use reasonable administrative and technical safeguards to help protect your information against loss, unauthorised access, alteration or disclosure. No method of online transmission or storage is completely secure.'],
      },
      {
        title: 'Sharing Your Information',
        icon: UsersRound,
        paragraphs: ['We do not sell or rent your personal information. We may share information with trusted service providers when needed to operate our services, such as payment, delivery and technology partners.'],
      },
      {
        title: 'Your Rights',
        icon: Scale,
        paragraphs: ['You may request access to, correction of or deletion of your personal information, subject to applicable law. Contact us to make a privacy-related request.'],
      },
      {
        title: 'Contact Us',
        icon: Mail,
        paragraphs: ['For questions about this Privacy Policy or how we handle your information, contact support@kisakusupplyagencies.co.ke.'],
      },
    ]
  : [
      {
        title: 'Acceptance of Terms',
        icon: ClipboardList,
        paragraphs: ['By accessing or using the Kisaku Supply Agencies website, you agree to these Terms of Service and any applicable laws and regulations. If you do not agree, please do not use the website.'],
      },
      {
        title: 'Orders and Payments',
        icon: ShoppingCart,
        paragraphs: ['All orders are subject to product availability and confirmation. We reserve the right to refuse or cancel an order where reasonably necessary. Payments must be made using the payment methods offered at checkout. Prices and product details may change without notice.'],
      },
      {
        title: 'Shipping and Delivery',
        icon: Truck,
        paragraphs: ['We aim to deliver orders within the timeframe provided at checkout. Delivery times are estimates and may be affected by circumstances outside our control. Please provide accurate delivery details and contact us if your order is delayed.'],
      },
      {
        title: 'Returns and Refunds',
        icon: RefreshCw,
        paragraphs: ['Returns, replacements and refunds are handled in accordance with our applicable return requirements. Please contact customer support promptly with your order details if an item is damaged, incorrect or otherwise needs attention.'],
      },
      {
        title: 'Limitation of Liability',
        icon: ShieldCheck,
        paragraphs: ['To the extent permitted by law, Kisaku Supply Agencies is not liable for indirect or consequential loss arising from your use of the website or products purchased through it. Nothing in these terms limits liability where it cannot lawfully be limited.'],
      },
      {
        title: 'Changes to Terms',
        icon: Scale,
        paragraphs: ['We may update these Terms of Service from time to time. Continued use of the website after updated terms are published means you accept the revised terms.'],
      },
      {
        title: 'Contact Us',
        icon: Mail,
        paragraphs: ['If you have questions about these Terms of Service, contact support@kisakusupplyagencies.co.ke.'],
      },
    ]);

const sideTitle = computed(() => isPrivacy.value ? 'Your Trust, Our Priority' : 'Shop with Confidence');
const sideDescription = computed(() => isPrivacy.value
  ? 'We are dedicated to keeping your information safe and secure while you shop with us.'
  : 'These terms help ensure a safe, transparent and reliable shopping experience for all our customers.');
</script>

<template>
  <div class="legal-site">
    <Header />
    <main>
      <section class="legal-hero" :class="{ privacy: isPrivacy }" :aria-labelledby="`${kind}-title`">
        <div class="legal-hero-inner">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <router-link to="/">Home</router-link><span aria-hidden="true">›</span><span>{{ title }}</span>
          </nav>
          <h1 :id="`${kind}-title`">{{ title }}</h1>
          <p>{{ subtitle }}</p>
          <span class="hero-accent" aria-hidden="true"></span>
        </div>
      </section>

      <div class="legal-content">
        <section class="legal-copy" :aria-label="title">
          <p class="legal-intro">
            <template v-if="isPrivacy">
              At Kisaku Supply Agencies, we are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how you can contact us about your information.
            </template>
            <template v-else>
              Welcome to Kisaku Supply Agencies. These Terms of Service outline the rules and conditions for using our website and purchasing our products. By accessing or using our site, you agree to these terms.
            </template>
          </p>

          <article v-for="section in sections" :key="section.title" class="legal-section">
            <span class="legal-icon"><component :is="section.icon" :size="23" aria-hidden="true" /></span>
            <div>
              <h2>{{ section.title }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </div>
          </article>
        </section>

        <aside class="legal-aside">
          <img
            :src="isPrivacy
              ? 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=720&q=85'
              : 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=720&q=85'"
            :alt="isPrivacy ? 'Digital security and privacy' : 'Terms of service document'"
            loading="lazy"
          >
          <h2>{{ sideTitle }}</h2>
          <span class="aside-accent" aria-hidden="true"></span>
          <p>{{ sideDescription }}</p>
        </aside>
      </div>

      <section class="legal-cta">
        <div>
          <h2>Shop Smart. Shop Kisaku.</h2>
          <p>Quality products, better living.</p>
        </div>
        <router-link to="/shop">Start Shopping <span aria-hidden="true">→</span></router-link>
      </section>
    </main>
    <StorefrontFooter :settings="{ store_name: 'Kisaku Supply Agencies', social: {} }" />
  </div>
</template>

<style scoped>
.legal-site{min-height:100vh;background:#fff;color:#0f2a44}.legal-hero{position:relative;isolation:isolate;min-height:125px;overflow:hidden;background:linear-gradient(100deg,#063f7c,#146bb5)}.legal-hero::before{position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(5,51,103,.92),rgba(5,68,132,.48),rgba(5,57,109,.08)),url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85') center 48%/cover no-repeat;content:''}.legal-hero.privacy::before{background-image:linear-gradient(90deg,rgba(5,51,103,.92),rgba(5,68,132,.48),rgba(5,57,109,.08)),url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85')}.legal-hero-inner{width:min(1240px,calc(100% - 40px));margin:0 auto;padding:15px 8px;color:#fff}.breadcrumbs{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:.7rem}.breadcrumbs a{color:#fff;text-decoration:none}.breadcrumbs a:hover{text-decoration:underline}.legal-hero h1{margin:0;font-size:clamp(1.8rem,4vw,2.4rem);font-weight:750;letter-spacing:-.03em}.legal-hero p{margin:1px 0 0;font-size:.82rem;font-weight:650}.hero-accent{display:block;width:52px;height:4px;margin-top:8px;background:#ff7900}.legal-content{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(210px,.7fr);gap:30px;width:min(1240px,calc(100% - 40px));margin:0 auto;padding:20px 8px 18px}.legal-copy{min-width:0}.legal-intro{margin:0 0 14px;color:#173b62;font-size:.8rem;line-height:1.55}.legal-section{display:flex;align-items:flex-start;gap:12px;margin:0 0 10px}.legal-icon{display:grid;width:44px;height:44px;flex:0 0 44px;place-items:center;border-radius:50%;background:#e5f0ff;color:#ff7900}.legal-section h2{margin:2px 0 3px;color:#102c49;font-size:.8rem;font-weight:750}.legal-section p{margin:0;color:#354f69;font-size:.7rem;line-height:1.48}.legal-aside{align-self:start;padding:12px 12px 14px;border-radius:10px;background:#f0f6ff;text-align:center}.legal-aside img{display:block;width:100%;height:145px;border-radius:8px;object-fit:cover}.legal-aside h2{max-width:220px;margin:12px auto 0;color:#102c49;font-size:1.05rem;font-weight:750;line-height:1.25}.aside-accent{display:block;width:46px;height:3px;margin:9px auto;background:#ff7900}.legal-aside p{margin:0;color:#354f69;font-size:.75rem;line-height:1.55}.legal-cta{position:relative;isolation:isolate;display:flex;min-height:66px;align-items:center;justify-content:space-between;gap:18px;overflow:hidden;width:min(1240px,calc(100% - 40px));margin:0 auto 16px;padding:10px 24px;border-radius:11px;background:linear-gradient(105deg,#06488f,#0b5aa5 58%,#103568);color:#fff}.legal-cta::after{position:absolute;z-index:-1;top:-50px;right:26%;width:100px;height:160px;transform:rotate(32deg);background:linear-gradient(90deg,#ff7900,#f6a14e);content:''}.legal-cta h2{margin:0;font-size:1.06rem;font-weight:750}.legal-cta p{margin:1px 0 0;font-size:.75rem}.legal-cta>a{display:flex;min-height:36px;align-items:center;gap:8px;padding:0 15px;border-radius:999px;background:#ff7900;color:#fff;font-size:.72rem;font-weight:750;text-decoration:none;white-space:nowrap}.legal-cta>a:hover{background:#e76d00}
@media(max-width:650px){.legal-hero{min-height:140px}.legal-hero-inner,.legal-content,.legal-cta{width:calc(100% - 28px)}.legal-hero-inner{padding:18px 0}.legal-content{grid-template-columns:1fr;gap:12px;padding:18px 0}.legal-section{gap:10px}.legal-icon{width:38px;height:38px;flex-basis:38px}.legal-aside{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:0 12px;text-align:left}.legal-aside img{grid-row:1/5;height:100%;min-height:120px}.legal-aside h2{margin:0;font-size:.95rem}.aside-accent{margin:7px 0}.legal-aside p{font-size:.7rem}.legal-cta{padding:10px 14px}.legal-cta::after{right:12%}.legal-cta h2{font-size:.92rem}.legal-cta p{font-size:.68rem}.legal-cta>a{padding:0 11px;font-size:.68rem}}
</style>
