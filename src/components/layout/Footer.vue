<template>
  <footer class="site-footer">
    <div class="footer-main">
      <section class="footer-brand">
        <router-link to="/" class="footer-logo">
          <img
            class="footer-logo-image"
            src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
            alt="Kisaku Supply Agencies"
          />
        </router-link>
        <p>Everyday essentials, thoughtfully selected for shoppers across Kenya.</p>
      </section>

      <nav class="footer-column" aria-label="Company">
        <h2>Company</h2>
        <router-link to="/about">About Kisaku</router-link>
        <router-link to="/shop">Our products</router-link>
        <router-link to="/about">Contact information</router-link>
      </nav>

      <nav class="footer-column" aria-label="Customer service">
        <h2>Customer service</h2>
        <router-link to="/orders">Order tracking</router-link>
        <router-link to="/profile">My account</router-link>
        <router-link to="/about">Help and information</router-link>
      </nav>

      <nav class="footer-column" aria-label="Shopping">
        <h2>Shopping</h2>
        <router-link to="/shop">Shop all</router-link>
        <router-link to="/shop">Browse products</router-link>
        <router-link to="/cart">Shopping cart</router-link>
      </nav>

      <section class="footer-newsletter" aria-labelledby="newsletter-title">
        <h2 id="newsletter-title">Newsletter</h2>
        <p>Get product updates and shopping news from Kisaku.</p>
        <form class="newsletter-form" @submit.prevent>
          <label class="sr-only" for="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" placeholder="Email address" disabled />
          <button type="submit" disabled>Coming soon</button>
        </form>
        <small>Sign-ups will be available soon.</small>
      </section>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} Kisaku Supply Agencies. All rights reserved.</p>
      <p>Kenya</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 48px max(20px, calc((100% - 1240px) / 2)) 18px;
  background: #102a43;
  color: #d7e0e8;
}

.footer-main {
  display: grid;
  grid-template-columns: minmax(190px, 1.25fr) repeat(3, minmax(120px, 0.8fr)) minmax(210px, 1.2fr);
  gap: 26px;
  padding-bottom: 38px;
}

.footer-brand p {
  max-width: 290px;
  margin: 15px 0 0;
  color: #b6c4d2;
  font-size: 0.88rem;
  line-height: 1.65;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-decoration: none;
}

.footer-logo-image {
  display: block;
  width: 190px;
  height: auto;
  padding: 5px 8px;
  border-radius: 5px;
  background: #fff;
}

.footer-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 11px;
}

.footer-column h2 {
  margin: 2px 0 5px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}

.footer-column a {
  color: #b6c4d2;
  font-size: 0.84rem;
  text-decoration: none;
  transition: color 140ms ease;
}

.footer-column a:hover {
  color: #fff;
}

.footer-newsletter h2 {
  margin: 2px 0 8px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}

.footer-newsletter p {
  margin: 0 0 12px;
  color: #b6c4d2;
  font-size: 0.82rem;
  line-height: 1.5;
}

.newsletter-form {
  display: flex;
  min-height: 40px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 4px;
}

.newsletter-form input {
  width: 100%;
  min-width: 0;
  padding: 0 9px;
  border: 0;
  background: #fff;
  color: #102c49;
  font: inherit;
  font-size: 0.75rem;
}

.newsletter-form input:disabled {
  background: #e8edf2;
  color: #64748b;
  opacity: 1;
}

.newsletter-form button {
  flex: 0 0 auto;
  padding: 0 9px;
  border: 0;
  background: #f58216;
  color: #fff;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
}

.newsletter-form button:disabled {
  background: #9a6a3b;
  cursor: not-allowed;
}

.footer-newsletter > small {
  display: block;
  margin-top: 7px;
  color: #aab8c7;
  font-size: 0.71rem;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 17px;
  border-top: 1px solid rgb(255 255 255 / 14%);
  color: #aab8c7;
  font-size: 0.76rem;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 980px) {
  .site-footer {
    padding: 38px 20px 16px;
  }

  .footer-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 30px 22px;
  }

  .footer-brand,
  .footer-newsletter {
    grid-column: 1 / -1;
  }
}

@media (max-width: 400px) {
  .footer-main {
    grid-template-columns: 1fr;
  }
}
</style>
