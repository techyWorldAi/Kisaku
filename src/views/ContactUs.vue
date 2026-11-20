<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send, UserRound } from 'lucide-vue-next';
import Header from '../components/layout/Menu.vue';
import StorefrontFooter from '../components/storefront/StorefrontFooter.vue';
import { storefrontAPI } from '../services/api';
import type { StoreSettings } from '../services/api';

const customerSupportEmail = 'support@kisakusupplyagencies.co.ke';
const vendorSupportEmail = 'vendorsupport@kisakusupplyagencies.co.ke';
const phoneNumber = '+254 796 819798';
const whatsappNumber = '254796819798';
const storeSettings = ref<StoreSettings>({ store_name: 'Kisaku Supply Agencies', social: {} });

const name = ref('');
const email = ref('');
const phone = ref('');
const subject = ref('Customer service');
const message = ref('');
const formStatus = ref('');

const recipient = () => subject.value === 'Supplier and vendor support'
  ? vendorSupportEmail
  : customerSupportEmail;

function submitMessage() {
  const mailSubject = `${subject.value} - Website enquiry`;
  const body = [
    `Name: ${name.value.trim()}`,
    `Email: ${email.value.trim()}`,
    `Phone: ${phone.value.trim() || 'Not provided'}`,
    '',
    message.value.trim(),
  ].join('\n');

  formStatus.value = 'Your email app will open with your message ready to send.';
  window.location.href = `mailto:${recipient()}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
}

onMounted(async () => {
  try {
    const storefront = await storefrontAPI.getPublished();
    storeSettings.value = storefront.settings;
  } catch (error) {
    console.error('Failed to load published storefront settings for Contact page:', error);
  }
});
</script>

<template>
  <div class="contact-site">
    <Header :store-settings="storeSettings" />

    <main>
      <section class="contact-hero" aria-labelledby="contact-title">
        <div class="contact-hero-inner">
          <h1 id="contact-title">Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team<br class="desktop-break"> for any inquiries, support or feedback.</p>
          <span class="hero-accent" aria-hidden="true"></span>
        </div>
      </section>

      <div class="contact-content">
        <section class="contact-cards" aria-label="Contact details">
          <article class="contact-card">
            <span class="contact-icon"><MapPin :size="25" fill="currentColor" aria-hidden="true" /></span>
            <h2>Visit Us</h2>
            <p>Kisaku Supply Agencies<br>Nairobi, Kenya</p>
            <a href="https://maps.google.com/?q=Kisaku+Supply+Agencies+Nairobi+Kenya" target="_blank" rel="noopener noreferrer">Get directions</a>
          </article>

          <article class="contact-card">
            <span class="contact-icon"><Phone :size="24" fill="currentColor" aria-hidden="true" /></span>
            <h2>Call Us</h2>
            <a class="contact-primary" :href="`tel:${phoneNumber.replace(/\s/g, '')}`">{{ phoneNumber }}</a>
            <p class="contact-muted">Mon - Sat: 8:00 AM - 6:00 PM</p>
          </article>

          <article class="contact-card">
            <span class="contact-icon"><Mail :size="25" aria-hidden="true" /></span>
            <h2>Email Us</h2>
            <a :href="`mailto:${customerSupportEmail}`">{{ customerSupportEmail }}</a>
            <p class="contact-muted">Customer service support</p>
            <a :href="`mailto:${vendorSupportEmail}`">{{ vendorSupportEmail }}</a>
            <p class="contact-muted">Suppliers and vendor support</p>
          </article>
        </section>

        <section class="contact-main-grid">
          <div class="message-panel">
            <span class="section-accent" aria-hidden="true"></span>
            <h2>Send Us a Message</h2>
            <p class="panel-intro">Fill out the form below and our team will get back to you.</p>

            <form class="contact-form" @submit.prevent="submitMessage">
              <label class="form-field">
                <UserRound :size="17" aria-hidden="true" />
                <span class="sr-only">Your name</span>
                <input v-model.trim="name" name="name" type="text" autocomplete="name" placeholder="Your Name *" required>
              </label>
              <label class="form-field">
                <Mail :size="17" aria-hidden="true" />
                <span class="sr-only">Your email</span>
                <input v-model.trim="email" name="email" type="email" autocomplete="email" placeholder="Your Email *" required>
              </label>
              <label class="form-field">
                <Phone :size="17" aria-hidden="true" />
                <span class="sr-only">Your phone</span>
                <input v-model.trim="phone" name="phone" type="tel" autocomplete="tel" placeholder="Your Phone">
              </label>
              <label class="form-field subject-field">
                <span class="sr-only">Select subject</span>
                <select v-model="subject" name="subject">
                  <option>Customer service</option>
                  <option>Order support</option>
                  <option>Supplier and vendor support</option>
                  <option>Other inquiry</option>
                </select>
              </label>
              <label class="form-field message-field">
                <MessageCircle :size="17" aria-hidden="true" />
                <span class="sr-only">Your message</span>
                <textarea v-model.trim="message" name="message" placeholder="Your Message *" required></textarea>
              </label>
              <button class="send-button" type="submit">
                Send Message <Send :size="17" aria-hidden="true" />
              </button>
              <p v-if="formStatus" class="form-status" role="status">{{ formStatus }}</p>
              <p class="form-note">Your email app will open so you can send your message.</p>
            </form>
          </div>

          <aside class="location-panel">
            <iframe
              class="location-map"
              title="Map showing Kisaku Supply Agencies in Nairobi, Kenya"
              src="https://maps.google.com/maps?q=Kisaku%20Supply%20Agencies%2C%20Nairobi%2C%20Kenya&t=&z=14&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <div class="location-details">
              <section class="location-detail">
                <MapPin :size="19" fill="currentColor" aria-hidden="true" />
                <div>
                  <h3>Our Location</h3>
                  <p>Kisaku Supply Agencies<br>Nairobi, Kenya</p>
                </div>
              </section>
              <section class="location-detail">
                <Clock3 :size="19" aria-hidden="true" />
                <div>
                  <h3>Working Hours</h3>
                  <p>Mon - Sat: 8:00 AM - 6:00 PM</p>
                </div>
              </section>
            </div>
          </aside>
        </section>

        <section class="quick-support" aria-label="WhatsApp support">
          <span class="whatsapp-icon"><MessageCircle :size="29" aria-hidden="true" /></span>
          <span class="support-divider" aria-hidden="true"></span>
          <div class="support-copy">
            <h2>Need Quick Support?</h2>
            <p>Chat with us on WhatsApp for instant assistance.</p>
          </div>
          <a :href="`https://wa.me/${whatsappNumber}`" target="_blank" rel="noopener noreferrer" class="whatsapp-button">
            <MessageCircle :size="18" aria-hidden="true" /> Chat on WhatsApp
          </a>
        </section>
      </div>
    </main>

    <StorefrontFooter :settings="storeSettings" />
  </div>
</template>

<style scoped>
.contact-site{min-height:100vh;background:#fff;color:#0f2a44}.contact-hero{position:relative;isolation:isolate;min-height:174px;overflow:hidden;background:linear-gradient(110deg,#0b4e91 0%,#1469b1 52%,#72a8d7 100%);color:#fff}.contact-hero::before{position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(8,47,91,.83),rgba(8,47,91,.24)),url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1800&q=85') center 53%/cover no-repeat;content:''}.contact-hero-inner{width:min(1240px,calc(100% - 40px));margin:0 auto;padding:32px 8px}.contact-hero h1{margin:0;font-size:clamp(2rem,4.4vw,2.8rem);font-weight:750;letter-spacing:-.03em}.contact-hero p{margin:5px 0 0;font-size:.95rem;line-height:1.55}.hero-accent,.section-accent{display:block;width:60px;height:4px;background:#ff7900}.hero-accent{margin-top:11px}.contact-content{width:min(1240px,calc(100% - 40px));margin:0 auto;padding-bottom:24px}.contact-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:-3px}.contact-card{position:relative;display:flex;min-height:145px;flex-direction:column;align-items:center;justify-content:center;padding:14px 12px;border:1px solid #e8edf2;border-radius:9px;background:#fff;box-shadow:0 6px 20px rgba(15,42,68,.08);text-align:center}.contact-icon{display:grid;width:44px;height:44px;place-items:center;margin-bottom:7px;border-radius:50%;background:#fff0e7;color:#f16600}.contact-card h2{margin:0 0 5px;color:#0f2a44;font-size:.95rem;font-weight:750}.contact-card p,.contact-card a{margin:0;color:#173b62;font-size:.76rem;line-height:1.55}.contact-card a{text-decoration:none}.contact-card a:hover{text-decoration:underline}.contact-card .contact-primary{font-weight:750}.contact-card .contact-muted{color:#718096;font-size:.68rem}.contact-main-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;margin-top:22px}.message-panel,.location-panel{overflow:hidden;border:1px solid #e2e8ef;border-radius:9px;background:#fff;box-shadow:0 3px 12px rgba(15,42,68,.04)}.message-panel{padding:16px 18px}.section-accent{width:34px;height:3px;margin-bottom:7px}.message-panel h2{margin:0;color:#0f2a44;font-size:1.28rem;font-weight:750}.panel-intro{margin:3px 0 11px;color:#526579;font-size:.82rem}.contact-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.form-field{display:flex;min-width:0;min-height:39px;align-items:center;gap:9px;padding:0 10px;border:1px solid #e1e7ee;border-radius:7px;background:#fff;color:#8998a9}.form-field:focus-within{border-color:#0b5aa5;box-shadow:0 0 0 2px rgba(11,90,165,.1)}.form-field input,.form-field select,.form-field textarea{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#0f2a44;font:inherit;font-size:.78rem}.form-field input::placeholder,.form-field textarea::placeholder{color:#75869a}.form-field select{height:100%;cursor:pointer}.message-field{grid-column:1/-1;min-height:74px;align-items:flex-start;padding-top:10px}.message-field textarea{height:55px;resize:vertical}.send-button{display:flex;min-height:42px;grid-column:1/-1;align-items:center;justify-content:center;gap:10px;border:0;border-radius:7px;background:#0b5aa5;color:#fff;font:inherit;font-size:.82rem;font-weight:750;cursor:pointer}.send-button:hover{background:#084981}.form-note,.form-status{grid-column:1/-1;margin:0;color:#64748b;font-size:.7rem}.form-status{color:#12633b}.location-panel{display:flex;flex-direction:column}.location-map{display:block;width:100%;min-height:196px;flex:1;border:0;background:#e9f1f7}.location-details{padding:0 15px}.location-detail{display:flex;gap:11px;padding:12px 4px;color:#f16600}.location-detail+.location-detail{border-top:1px solid #e5eaf0}.location-detail h3{margin:0 0 4px;color:#0f2a44;font-size:.82rem;font-weight:750}.location-detail p{margin:0;color:#354f69;font-size:.72rem;line-height:1.5}.quick-support{display:flex;min-height:68px;align-items:center;gap:16px;margin-top:18px;padding:10px clamp(14px,5vw,55px);border-radius:9px;background:#e4f1ff}.whatsapp-icon{display:grid;width:42px;height:42px;flex:0 0 42px;place-items:center;border:3px solid #fff;border-radius:50%;background:#13b85a;color:#fff}.support-divider{width:1px;height:34px;background:#82acd1}.support-copy{min-width:0}.support-copy h2{margin:0;color:#0f2a44;font-size:.9rem;font-weight:750}.support-copy p{margin:2px 0 0;color:#354f69;font-size:.72rem}.whatsapp-button{display:flex;min-height:39px;align-items:center;justify-content:center;gap:8px;margin-left:auto;padding:0 18px;border-radius:999px;background:#12ad4f;color:#fff;font-size:.76rem;font-weight:750;text-decoration:none}.whatsapp-button:hover{background:#0c9541}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:700px){.contact-hero{min-height:160px}.contact-hero-inner{width:calc(100% - 32px);padding:29px 0}.desktop-break{display:none}.contact-content{width:calc(100% - 28px)}.contact-cards{grid-template-columns:1fr;margin-top:14px;gap:9px}.contact-card{min-height:130px}.contact-main-grid{grid-template-columns:1fr;margin-top:16px}.location-map{min-height:220px}.quick-support{flex-wrap:wrap;gap:10px;padding:12px}.support-copy{flex:1 1 calc(100% - 70px)}.support-divider{display:none}.whatsapp-button{width:100%;margin-left:0}.contact-form{gap:8px}}@media(max-width:420px){.contact-form{grid-template-columns:1fr}.form-field{min-height:42px}.message-field{grid-column:1;min-height:80px}.send-button,.form-note,.form-status{grid-column:1}.contact-card{padding:14px 8px}}
</style>
