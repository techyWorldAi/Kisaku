import { createRouter, createWebHistory } from 'vue-router'; // 1. Switched to createWebHistory
import { useAuthStore } from '../store/auth';

const router = createRouter({
  history: createWebHistory('/'), // 2. Updated to standard root web history
  scrollBehavior() {
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
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/Auth/ForgotPassword.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/Auth/ResetPassword.vue'),
      meta: { publicRoute: true }
    },
    {
      path: '/vendor/set-password',
      name: 'VendorSetPassword',
      component: () => import('../views/Auth/VendorSetPassword.vue'),
      meta: { publicRoute: true }
    },
    {
      path: '/access-denied',
      name: 'AccessDenied',
      component: () => import('../views/Auth/AccessDenied.vue')
    },
    {
      path: '/vendor',
      component: () => import('../views/vendor/VendorLayout.vue'),
      meta: { requiresAuth: true, roles: ['vendor'] },
      children: [
        { path: '', name: 'VendorDashboard', component: () => import('../views/vendor/Dashboard.vue') },
        { path: 'products', name: 'VendorProducts', component: () => import('../views/vendor/Products.vue') },
        { path: 'products/new', name: 'VendorProductNew', component: () => import('../views/vendor/ProductForm.vue') },
        { path: 'products/:id/edit', name: 'VendorProductEdit', component: () => import('../views/vendor/ProductForm.vue') },
        { path: 'orders', name: 'VendorOrders', component: () => import('../views/vendor/Orders.vue') },
        { path: 'orders/:id', name: 'VendorOrderDetail', component: () => import('../views/vendor/OrderDetail.vue') },
        { path: 'profile', name: 'VendorProfile', component: () => import('../views/vendor/Profile.vue') },
      ]
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
      path: '/admin/storefront',
      name: 'AdminStorefront',
      component: () => import('../views/admin/Storefront.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/storefront/preview',
      name: 'AdminStorefrontPreview',
      component: () => import('../views/admin/StorefrontPreview.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/sales',
      name: 'AdminSales',
      component: () => import('../views/admin/SalesOrders.vue'),
      meta: { requiresAuth: true, requiresSales: true }
    },
    {
      path: '/admin/audit-logs',
      name: 'AdminAuditLogs',
      component: () => import('../views/admin/AuditLogs.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
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
      path: '/admin/vendors',
      name: 'AdminVendors',
      component: () => import('../views/admin/Vendors.vue'),
      meta: { requiresAuth: true, roles: ['staff', 'admin', 'vendor_support'] }
    },
    {
      path: '/admin/vendors/:id',
      name: 'AdminVendorDetail',
      component: () => import('../views/admin/VendorDetail.vue'),
      meta: { requiresAuth: true, roles: ['staff', 'admin', 'vendor_support'] }
    },
    {
      path: '/admin/incoming-goods',
      name: 'AdminIncomingGoods',
      component: () => import('../views/admin/IncomingGoods.vue'),
      meta: { requiresAuth: true, roles: ['staff', 'admin', 'vendor_support', 'logistics'] }
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
      path: '/track-order',
      name: 'TrackOrder',
      component: () => import('../views/TrackOrder.vue'),
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

  if (to.meta.publicRoute) return true;
  
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
    return safeRedirect ?? (
      authStore.isVendor
        ? '/vendor'
        : authStore.isSalesAgent
          ? '/admin/sales'
          : authStore.canAccessAdmin
            ? '/admin/dashboard'
            : '/'
    );
  }
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const allowedRoles = to.meta.roles as string[];
    if (!allowedRoles.includes(authStore.user?.role ?? '')) return '/access-denied';
  }
  if (to.meta.requiresStaff && !authStore.canAccessAdmin) return '/access-denied';
  if (to.meta.requiresAdmin && !authStore.isAdmin) return '/profile';
  if (to.meta.requiresSales && !authStore.canAccessSales) return '/profile';
});

export default router;
