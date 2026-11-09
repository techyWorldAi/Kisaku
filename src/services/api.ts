import axios from 'axios';
import {
  createDemoOrder,
  demoCategories,
  getDemoCurrentUser,
  getDemoDashboardSummary,
  getDemoOrders,
  getDemoProduct,
  getDemoProducts,
  getDemoUsers,
  isDemoMode,
  loginDemo,
  removeDemoProduct,
  saveDemoProduct,
  updateDemoOrderStatus,
} from './demoStore';

export { isDemoMode };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.fuze.co.ke/api').replace(/\/+$/, '');

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


// Enhanced request interceptor with better token handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request configuration failed.');
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    console.error('💥 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('authToken');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden (Admin access)
    if (error.response?.status === 403) {
      if (!window.location.pathname.includes('/profile')) {
        window.location.href = '/profile';
      }
    }
    
    return Promise.reject(error);
  }
);

// Debug function to check token validity
export const checkTokenStatus = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  ordersCount?: number;
  phone_number?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at?: string;
}

export interface StoreSettings {
  store_name: string;
  tagline?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social: Record<string, string>;
}

export interface StorefrontBanner {
  id: number;
  title: string;
  image_url: string;
  alt_text?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface StorefrontSection {
  id: number;
  section_key: string;
  type: string;
  title?: string;
  sort_order: number;
  is_visible: boolean;
  config: Record<string, unknown>;
}

export interface PublishedStorefront {
  settings: StoreSettings;
  sections: StorefrontSection[];
  banners: StorefrontBanner[];
}

export interface AdminStorefront {
  draft: PublishedStorefront;
  published: PublishedStorefront | null;
}

export type StorefrontBannerInput = Omit<StorefrontBanner, 'id'>;
export type StorefrontSectionInput = Omit<StorefrontSection, 'id'>;

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  rating?: number | null;
  review_count?: number | null;
  stock: number;
  image: string;
  category_id: number;
  category?: Category;
  created_at?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  rating?: number | null;
  review_count?: number | null;
  stock: number;
  image?: string;
  category_id: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number | null;
  rating?: number | null;
  review_count?: number | null;
  stock?: number;
  image?: string;
  category_id?: number;
}

// Order related interfaces
export interface Order {
  id: number;
  order_number?: string;
  order_tag?: string;
  tag?: string;
  source?: string;
  sales_agent_id?: number;
  assisted_by?: number;
  user_id: number;
  user?: User;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  delivery_method?: string;
  delivery_address?: OrderDeliveryAddress;
  mpesa_receipt?: string;
  phone_number?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderDeliveryAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
}

export interface AdminDashboardSummary {
  product_count: number;
  customer_count: number;
  order_count: number;
  pending_order_count: number;
  delivered_order_count: number;
  cancelled_order_count: number;
  delivered_order_value: number;
  low_stock_product_count: number;
  out_of_stock_product_count: number;
  low_stock_products: Array<Pick<Product, 'id' | 'name' | 'stock'>>;
  recent_orders: Order[];
  order_trend: Array<{ date: string; count: number }>;
}

function isAdminDashboardSummary(value: unknown): value is AdminDashboardSummary {
  if (typeof value !== 'object' || value === null) return false;

  const summary = value as Record<string, unknown>;
  const numericFields = [
    'product_count',
    'customer_count',
    'order_count',
    'pending_order_count',
    'delivered_order_count',
    'cancelled_order_count',
    'delivered_order_value',
    'low_stock_product_count',
    'out_of_stock_product_count',
  ];

  return numericFields.every((field) => typeof summary[field] === 'number')
    && Array.isArray(summary.low_stock_products)
    && Array.isArray(summary.recent_orders)
    && Array.isArray(summary.order_trend);
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  delivery_address?: OrderDeliveryAddress;
  phone_number?: string;
  total?: number;
  payment_method?: string;
  delivery_method?: string;
}

export interface OrderItemRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
}

export interface SalesCustomer {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
}

export type EmployeeRole = 'sales_agent' | 'vendor_support' | 'finance' | 'logistics';

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  role: EmployeeRole;
}

export interface CreateSalesOrderRequest {
  customer_id?: number;
  customer_email?: string;
  items: OrderItemRequest[];
  phone_number?: string;
  delivery_method?: string;
  payment_method?: string;
}

export interface AuditLogRecord {
  id?: number | string;
  actor_id?: number | null;
  action?: string;
  event?: string;
  actor?: User | string;
  actor_name?: string;
  actor_email?: string;
  target?: unknown;
  target_type?: string;
  target_id?: number | string;
  details?: unknown;
  metadata?: unknown;
  created_at?: string;
  [key: string]: unknown;
}

function unwrapResponseData(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    return (value as { data: unknown }).data;
  }
  return value;
}

function parseResponseList<T>(value: unknown, key: string, label: string): T[] {
  let payload = unwrapResponseData(value);
  if (typeof payload === 'object' && payload !== null && key in payload) {
    payload = (payload as Record<string, unknown>)[key];
  }
  if (!Array.isArray(payload)) {
    throw new Error(`The ${label} endpoint returned an unsupported response.`);
  }
  return payload as T[];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: unknown } } }).response;
    if (typeof response?.data?.error === 'string') return response.data.error;
  }
  return error instanceof Error ? error.message : fallback;
}

function parseSalesCustomer(value: unknown): value is SalesCustomer {
  if (typeof value !== 'object' || value === null) return false;
  const customer = value as Record<string, unknown>;
  return typeof customer.id === 'number'
    && typeof customer.name === 'string'
    && typeof customer.email === 'string';
}

function parseSalesOrder(value: unknown): Order {
  let payload = unwrapResponseData(value);
  if (typeof payload === 'object' && payload !== null && 'order' in payload) {
    payload = (payload as { order: unknown }).order;
  }
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('The sales order endpoint returned an unsupported response.');
  }
  const order = payload as Record<string, unknown>;
  if (typeof order.id !== 'number' || typeof order.total !== 'number' || typeof order.status !== 'string') {
    throw new Error('The sales order endpoint returned an incomplete order.');
  }
  return order as unknown as Order;
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    if (isDemoMode()) return loginDemo(credentials.email, credentials.password);

    try {
      const response = await api.post('/auth/login', credentials);
      
      const authResponse = response.data.data;
      return authResponse;
    } catch (error: any) {
      console.error('API login request failed.');
      throw error;
    }
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    if (isDemoMode()) {
      throw new Error('Sign-up is unavailable in the local demo. Use the demo customer account shown on the login page.');
    }
    const response = await api.post('/auth/signup', userData);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    if (isDemoMode()) {
      const user = getDemoCurrentUser();
      if (!user) throw new Error('Your demo session has expired. Please sign in again.');
      return user;
    }

    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  health: async (): Promise<any> => {
    if (isDemoMode()) return { status: 'ok', mode: 'local-demo' };

    const response = await api.get('/auth/health');
    return response.data;
  },

  // ADDED: Token validation function
  validateToken: async (): Promise<any> => {
    if (isDemoMode()) return { data: await authAPI.getProfile() };

    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('API authentication validation failed.');
      throw error;
    }
  },
};

export const productAPI = {
  // Public product endpoints (no auth required)
  getPublicProducts: async (categoryId?: number): Promise<Product[]> => {
    if (isDemoMode()) {
      const products = getDemoProducts();
      return categoryId ? products.filter((product) => product.category_id === categoryId) : products;
    }

    const url = categoryId ? `/products?category=${categoryId}` : '/products';
    const response = await api.get(url);
    return response.data;
  },

  getPublicProduct: async (id: number): Promise<Product> => {
    if (isDemoMode()) {
      const product = getDemoProduct(id);
      if (!product) throw new Error('This demo product is no longer available.');
      return product;
    }

    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Admin product endpoints (require admin auth)
  getProducts: async (): Promise<Product[]> => {
    if (isDemoMode()) return getDemoProducts();

    const response = await api.get('/admin/products');
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    if (isDemoMode()) {
      const product = getDemoProduct(id);
      if (!product) throw new Error('This demo product is no longer available.');
      return product;
    }

    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    if (isDemoMode()) {
      return saveDemoProduct({ ...product, id: Date.now(), image: product.image ?? '', created_at: new Date().toISOString() });
    }

    const response = await api.post('/admin/products', product);
    return response.data;
  },

  updateProduct: async (id: number, product: UpdateProductRequest): Promise<Product> => {
    if (isDemoMode()) {
      const current = getDemoProduct(id);
      if (!current) throw new Error('This demo product is no longer available.');
      return saveDemoProduct({ ...current, ...product });
    }

    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (isDemoMode()) {
      removeDemoProduct(id);
      return;
    }

    await api.delete(`/admin/products/${id}`);
  },

  // Category endpoints
  getCategories: async (): Promise<Category[]> => {
    if (isDemoMode()) return demoCategories;

    const response = await api.get('/categories');
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    if (isDemoMode()) {
      return getDemoProducts().filter((product) => product.category_id === categoryId);
    }

    const response = await api.get(`/products?category=${categoryId}`);
    return response.data;
  },
};

export const orderAPI = {
  // User order endpoints
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    if (isDemoMode()) {
      return createDemoOrder(
        orderData,
        orderData.total ?? orderData.items.reduce((sum, item) => {
          const product = getDemoProduct(item.product_id);
          return sum + (product?.price ?? 0) * item.quantity;
        }, 0),
        orderData.payment_method ?? 'cash',
        orderData.delivery_method ?? 'delivery',
      );
    }

    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    if (isDemoMode()) return getDemoOrders();

    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    if (isDemoMode()) {
      const order = getDemoOrders().find((item) => item.id === id);
      if (!order) throw new Error('This demo order could not be found.');
      return order;
    }

    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Admin order endpoints
  getOrders: async (): Promise<Order[]> => {
    if (isDemoMode()) return getDemoOrders();

    const response = await api.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (id: number, status: UpdateOrderStatusRequest): Promise<void> => {
    if (isDemoMode()) {
      updateDemoOrderStatus(id, status.status);
      return;
    }

    await api.put(`/admin/orders/${id}/status`, status);
  },

  // Admin user endpoints
  getUsers: async (): Promise<User[]> => {
    if (isDemoMode()) return getDemoUsers();

    const response = await api.get('/admin/users');
    return response.data;
  },
};

export const salesAPI = {
  getCustomers: async (query: string): Promise<SalesCustomer[]> => {
    const response = await api.get('/sales/customers', { params: { q: query } });
    const customers = parseResponseList<unknown>(response.data, 'customers', 'sales customers');
    if (!customers.every(parseSalesCustomer)) {
      throw new Error('The sales customers endpoint returned invalid customer records.');
    }
    return customers;
  },

  createOrder: async (order: CreateSalesOrderRequest): Promise<Order> => {
    const response = await api.post('/sales/orders', order);
    return parseSalesOrder(response.data);
  },
};

export const auditAPI = {
  getAuditLogs: async (): Promise<AuditLogRecord[]> => {
    const response = await api.get('/admin/audit-logs');
    return parseResponseList<AuditLogRecord>(response.data, 'logs', 'admin audit logs');
  },
};

function parseStorefrontSnapshot(value: unknown, label: string): PublishedStorefront {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`The ${label} endpoint returned an unsupported storefront.`);
  }
  const snapshot = value as Record<string, unknown>;
  if (
    typeof snapshot.settings !== 'object'
    || snapshot.settings === null
    || !Array.isArray(snapshot.sections)
    || !Array.isArray(snapshot.banners)
  ) {
    throw new Error(`The ${label} endpoint returned an incomplete storefront.`);
  }
  return snapshot as unknown as PublishedStorefront;
}

export const storefrontAPI = {
  getPublished: async (): Promise<PublishedStorefront> => {
    const response = await api.get('/storefront');
    return parseStorefrontSnapshot(unwrapResponseData(response.data), 'public storefront');
  },

  getAdminState: async (): Promise<AdminStorefront> => {
    const response = await api.get('/admin/storefront');
    const payload = unwrapResponseData(response.data);
    if (typeof payload !== 'object' || payload === null || !('draft' in payload)) {
      throw new Error('The admin storefront endpoint returned an unsupported response.');
    }
    const state = payload as Record<string, unknown>;
    const draft = parseStorefrontSnapshot(state.draft, 'admin storefront draft');
    const published = state.published === null || state.published === undefined
      ? null
      : parseStorefrontSnapshot(state.published, 'published storefront');
    return { draft, published };
  },

  saveSettings: async (settings: StoreSettings): Promise<void> => {
    await api.put('/admin/storefront/settings', settings);
  },

  publish: async (): Promise<void> => {
    await api.post('/admin/storefront/publish');
  },

  getBanners: async (): Promise<StorefrontBanner[]> => {
    const response = await api.get('/admin/storefront/banners');
    return parseResponseList<StorefrontBanner>(response.data, 'banners', 'storefront banners');
  },

  createBanner: async (banner: StorefrontBannerInput): Promise<StorefrontBanner> => {
    const response = await api.post('/admin/storefront/banners', banner);
    return unwrapResponseData(response.data) as StorefrontBanner;
  },

  updateBanner: async (id: number, banner: Partial<StorefrontBannerInput>): Promise<StorefrontBanner> => {
    const response = await api.put(`/admin/storefront/banners/${id}`, banner);
    return unwrapResponseData(response.data) as StorefrontBanner;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await api.delete(`/admin/storefront/banners/${id}`);
  },

  reorderBanners: async (ids: number[]): Promise<void> => {
    await api.put('/admin/storefront/banners/reorder', { ids });
  },

  getSections: async (): Promise<StorefrontSection[]> => {
    const response = await api.get('/admin/storefront/sections');
    return parseResponseList<StorefrontSection>(response.data, 'sections', 'storefront sections');
  },

  createSection: async (section: StorefrontSectionInput): Promise<StorefrontSection> => {
    const response = await api.post('/admin/storefront/sections', section);
    return unwrapResponseData(response.data) as StorefrontSection;
  },

  updateSection: async (id: number, section: Partial<StorefrontSectionInput>): Promise<StorefrontSection> => {
    const response = await api.put(`/admin/storefront/sections/${id}`, section);
    return unwrapResponseData(response.data) as StorefrontSection;
  },

  deleteSection: async (id: number): Promise<void> => {
    await api.delete(`/admin/storefront/sections/${id}`);
  },

  reorderSections: async (ids: number[]): Promise<void> => {
    await api.put('/admin/storefront/sections/reorder', { ids });
  },

  uploadImage: async (file: File, kind: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    const response = await api.post('/admin/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload = unwrapResponseData(response.data);
    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object' && payload !== null) {
      const upload = payload as Record<string, unknown>;
      if (typeof upload.url === 'string') return upload.url;
      if (typeof upload.image_url === 'string') return upload.image_url;
    }
    throw new Error('The image upload endpoint did not return an image URL.');
  },
};

export const adminCategoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/admin/categories');
    return parseResponseList<Category>(response.data, 'categories', 'admin categories');
  },

  create: async (category: Pick<Category, 'name' | 'description'>): Promise<Category> => {
    const response = await api.post('/admin/categories', category);
    return unwrapResponseData(response.data) as Category;
  },

  update: async (id: number, category: Partial<Pick<Category, 'name' | 'description'>>): Promise<Category> => {
    const response = await api.put(`/admin/categories/${id}`, category);
    return unwrapResponseData(response.data) as Category;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
};

export const adminAPI = {
  createEmployee: async (account: CreateEmployeeRequest): Promise<User> => {
    if (isDemoMode()) {
      throw new Error('Employee accounts cannot be created in local demo mode.');
    }

    const response = await api.post('/admin/users', account);
    const payload = unwrapResponseData(response.data);
    if (typeof payload !== 'object' || payload === null) {
      throw new Error('The employee creation endpoint returned an unsupported response.');
    }
    const user = payload as Record<string, unknown>;
    if (
      typeof user.id !== 'number'
      || typeof user.name !== 'string'
      || typeof user.email !== 'string'
      || user.role !== account.role
    ) {
      throw new Error('The employee creation endpoint returned an invalid account.');
    }
    return payload as User;
  },

  getDashboardSummary: async (from: string, to: string): Promise<AdminDashboardSummary> => {
    if (isDemoMode()) return getDemoDashboardSummary(from, to);

    const response = await api.get('/admin/dashboard', { params: { from, to } });
    if (!isAdminDashboardSummary(response.data)) {
      throw new Error('The admin dashboard endpoint returned an unsupported response.');
    }
    return response.data;
  },
};

export const normalizePhone = (num: string): string => {
  let cleaned = num.trim();
  if (cleaned.startsWith("07")) {
    return "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("+254")) {
    return cleaned.substring(1);
  } else if (cleaned.startsWith("254")) {
    return cleaned;
  }
  return cleaned;
};

export interface MpesaResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class PaymentService {
  static async processMpesaPayment(phone: string, amount: number): Promise<MpesaResponse> {
    const normalizedPhone = normalizePhone(phone);
    
    // Ensure amount is an integer (M-Pesa expects whole numbers)
    const amountInt = Math.round(amount);

    try {
      const res = await fetch("https://mpesaapi-sbss.onrender.com/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: amountInt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: "Payment initiated successfully. Check your phone to complete the transaction.",
          data
        };
      } else {
        return {
          success: false,
          message: data.message || "Payment failed. Please try again.",
          data
        };
      }
    } catch (error) {
      console.error('MPesa payment error:', error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  static validatePhone(phone: string): string | null {
    const normalized = normalizePhone(phone);
    const phoneRegex = /^254[17]\d{8}$/;
    if (!phoneRegex.test(normalized)) {
      return "Please enter a valid Kenyan phone number";
    }
    return null;
  }
}

export default api;