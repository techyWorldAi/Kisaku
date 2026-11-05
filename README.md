
---

## 🎨 **Frontend README (Vue.js + TypeScript + Tailwind CSS)**

```markdown
# 🎨 Frontend – Mini E-Commerce Platform

## 📌 Overview
This is the **frontend interface** for the Mini E-Commerce Platform.  
It is built with **Vue.js 3 (Composition API)**, **Vite**, and **Tailwind CSS**.  

The frontend allows:
- Customers to browse products, manage carts, and complete mock payments.
- Admins to log in, manage products, and view all orders.

---

## ⚙️ Tech Stack
- **Framework:** Vue.js 3 + Vite
- **Language:** TypeScript
- **State Management:** Pinia / Vuex
- **Routing:** Vue Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tool:** Vite

---

## ✨ Features
- ✅ JWT-based Authentication
- ✅ Role-based access (Customer / Admin)
- ✅ Product listing and detailed views
- ✅ Shopping cart and checkout
- ✅ Payment status feedback (polling / websocket)
- ✅ Admin dashboard for managing products and orders
- ✅ Fully responsive (mobile-first design)
- ✅ TypeScript support for better maintainability

---

## 🗂️ Folder Structure
```bash
frontend/
├── src/
│   ├── components/      # Reusable UI elements
│   ├── views/           # Page components (Login, Register, Store, Admin)
│   ├── store/           # Pinia / Vuex store
│   ├── router/          # Vue Router setup
│   ├── assets/          # Images & static files
│   ├── utils/           # Helper functions
│   └── main.ts          # Entry file
├── public/
├── package.json
└── vite.config.ts
```

## Local storefront demo

The ignored `.env.local` file enables a local-only demo catalogue for development. Restart Vite after changing it:

```bash
npm run dev
```

Local demo accounts:

- Customer — `customer@kisaku.test` / `KisakuDemo123!`
- Administrator — `admin@kisaku.test` / `KisakuAdmin123!`
- Staff — `staff@kisaku.test` / `KisakuStaff123!`

The customer account can shop and place test orders. Administrator and staff accounts can use the existing dashboard, product, order, and account/employee screens; staff do not see administrator-only revenue. The header shows the signed-in user's first name, and sign-in returns to the page that prompted it.

The sample products, prices, stock, product edits, order updates and orders are illustrative and stored in this browser. Checkout is simulated locally; M-Pesa is not charged and no order is sent to the live backend. Use **Reset demo data** on the login page to clear saved demo orders and restore sample stock and products.

The demo is guarded by Vite's development mode and will not be enabled in production builds. To use the live API locally, remove `VITE_DEMO_MODE=true` from `.env.local` and restart the dev server.
# Kisaku
