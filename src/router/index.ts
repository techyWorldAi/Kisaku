import { createRouter, createWebHashHistory } from 'vue-router'; // 1. Changed to createWebHashHistory
import { useAuthStore } from '../store/auth';

const router = createRouter({
  history: createWebHashHistory('/Kisaku/'), // 2. Updated strategy with your repository base path
  scrollBehavior() {
    // Scroll to top on every route change
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresStaff: true }
    },
    {
      path: '/admin/products',
      name: 'AdminProducts',
      component: () => import('../views/admin/Products.vue'),
      meta: { requiresAuth: true, requiresStaff: true }
    },
    {
      path: '/shop',
      name: 'Shop',
      component: () => import('../views/ShopPage.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/AboutUs.vue'),
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: () => import('../views/ProductDetail.vue'),
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('../views/admin/Users.vue'),
      meta: { requiresAuth: true, requiresStaff: true }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/orders',
      name: 'AdminOrders',
      component: () => import('../views/admin/Orders.vue'),
      meta: { requiresAuth: true, requiresStaff: true }
    },
  ],
});

// Navigation guards
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated && localStorage.getItem('authToken')) {
    await authStore.checkAuth();
  }

  const requestedRedirect = typeof to.query.redirect === 'string' ? to.query.redirect : null;
  const safeRedirect = requestedRedirect
    && requestedRedirect.startsWith('/')
    && !requestedRedirect.startsWith('//')
    && !['/login', '/signup'].includes(requestedRedirect)
    ? requestedRedirect
    : null;

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return safeRedirect ?? (authStore.canAccessAdmin ? '/admin/dashboard' : '/');
  }
  if (to.meta.requiresStaff && !authStore.canAccessAdmin) return '/profile';
  if (to.meta.requiresAdmin && !authStore.isAdmin) return '/profile';
});

export default router;
