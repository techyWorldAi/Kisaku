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
  user_id: number;
  user?: User;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  delivery_method?: string;
  mpesa_receipt?: string;
  phone_number?: string;
  created_at: string;
  order_items?: OrderItem[];
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

export const adminAPI = {
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