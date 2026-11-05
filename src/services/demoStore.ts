import type {
  AuthResponse,
  AdminDashboardSummary,
  Category,
  CreateOrderRequest,
  Order,
  Product,
  User,
} from './api';

const demoProductsKey = 'kisakuDemoProducts';
const demoOrdersKey = 'kisakuDemoOrders';
const demoAccounts: Array<{ user: User; password: string }> = [
  {
    user: {
      id: 7001,
      name: 'Kisaku Test Customer',
      email: 'customer@kisaku.test',
      role: 'customer',
      created_at: '2026-01-01T09:00:00.000Z',
    },
    password: 'KisakuDemo123!',
  },
  {
    user: {
      id: 7002,
      name: 'Kisaku Administrator',
      email: 'admin@kisaku.test',
      role: 'admin',
      created_at: '2026-01-01T09:00:00.000Z',
    },
    password: 'KisakuAdmin123!',
  },
  {
    user: {
      id: 7003,
      name: 'Kisaku Store Staff',
      email: 'staff@kisaku.test',
      role: 'staff',
      created_at: '2026-01-01T09:00:00.000Z',
    },
    password: 'KisakuStaff123!',
  },
];

export const demoCategories: Category[] = [
  { id: 101, name: 'Home & Kitchen', description: 'Everyday home and kitchen essentials.' },
  { id: 102, name: 'Tech & Electronics', description: 'Useful technology and accessories.' },
  { id: 103, name: 'Beauty & Personal Care', description: 'Personal care essentials.' },
  { id: 104, name: 'Fashion & Lifestyle', description: 'Clothing and everyday accessories.' },
  { id: 105, name: 'Automotive', description: 'Practical motoring accessories.' },
];

const initialProducts: Product[] = [
  {
    id: 201,
    name: '2L Stainless Steel Electric Kettle',
    description: 'A practical 2-litre electric kettle with a stainless steel body, automatic shut-off and a comfortable carry handle for everyday tea and coffee.',
    price: 2499,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    category_id: 101,
    category: demoCategories[0],
    created_at: '2026-10-28T09:00:00.000Z',
  },
  {
    id: 202,
    name: '1.8L Countertop Blender',
    description: 'A countertop blender for smoothies, sauces and everyday kitchen preparation, with a large 1.8-litre jug and simple controls.',
    price: 5499,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    category_id: 101,
    category: demoCategories[0],
    created_at: '2026-10-27T09:00:00.000Z',
  },
  {
    id: 203,
    name: 'Wireless Bluetooth Headphones',
    description: 'Comfortable wireless over-ear headphones for music, calls and commuting, with soft ear cushions and a foldable design.',
    price: 3299,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category_id: 102,
    category: demoCategories[1],
    created_at: '2026-10-26T09:00:00.000Z',
  },
  {
    id: 204,
    name: '20,000mAh Portable Power Bank',
    description: 'A portable 20,000mAh power bank for charging compatible phones and devices while travelling or away from a power outlet.',
    price: 2799,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    category_id: 102,
    category: demoCategories[1],
    created_at: '2026-10-25T09:00:00.000Z',
  },
  {
    id: 205,
    name: 'USB-C Fast Charging Cable',
    description: 'A durable USB-C charging cable for compatible phones, tablets and accessories. Suitable for daily use at home, work or on the move.',
    price: 699,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=800&q=80',
    category_id: 102,
    category: demoCategories[1],
    created_at: '2026-10-24T09:00:00.000Z',
  },
  {
    id: 206,
    name: 'Everyday Face Care Set',
    description: 'A simple personal care set for a daily routine, packed for convenient storage and travel.',
    price: 1899,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    category_id: 103,
    category: demoCategories[2],
    created_at: '2026-10-23T09:00:00.000Z',
  },
  {
    id: 207,
    name: 'Classic Everyday Backpack',
    description: 'A versatile everyday backpack with a roomy main compartment for work, school or short trips.',
    price: 2199,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    category_id: 104,
    category: demoCategories[3],
    created_at: '2026-10-22T09:00:00.000Z',
  },
  {
    id: 208,
    name: 'Polarized Driving Sunglasses',
    description: 'Lightweight polarized sunglasses with a classic frame, suitable for everyday outdoor use and driving.',
    price: 1499,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    category_id: 104,
    category: demoCategories[3],
    created_at: '2026-10-21T09:00:00.000Z',
  },
  {
    id: 209,
    name: 'Compact Car Phone Holder',
    description: 'A compact adjustable phone holder designed to keep a compatible smartphone visible and accessible in the car.',
    price: 999,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    category_id: 105,
    category: demoCategories[4],
    created_at: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 210,
    name: 'Rechargeable LED Desk Lamp',
    description: 'A compact rechargeable LED lamp with adjustable positioning for reading, studying and desk use.',
    price: 1799,
    stock: 17,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    category_id: 101,
    category: demoCategories[0],
    created_at: '2026-10-19T09:00:00.000Z',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Unable to read demo data (${key}).`, error);
    throw new Error(`Local demo data is invalid (${key}). Reset demo data and try again.`);
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isDemoMode() {
  return import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true';
}

export function resetDemoData() {
  localStorage.removeItem(demoProductsKey);
  localStorage.removeItem(demoOrdersKey);
  localStorage.removeItem('authToken');
}

export function getDemoProducts() {
  return readStorage(demoProductsKey, initialProducts).map((product) => ({
    ...product,
    category: product.category ?? demoCategories.find((category) => category.id === product.category_id),
  }));
}

export function getDemoProduct(id: number) {
  return getDemoProducts().find((product) => product.id === id);
}

export function saveDemoProduct(product: Product) {
  const savedProduct = {
    ...product,
    category: demoCategories.find((category) => category.id === product.category_id),
  };
  const products = getDemoProducts();
  const index = products.findIndex((item) => item.id === savedProduct.id);
  if (index >= 0) products[index] = savedProduct;
  else products.unshift(savedProduct);
  writeStorage(demoProductsKey, products);
  return savedProduct;
}

export function removeDemoProduct(id: number) {
  writeStorage(demoProductsKey, getDemoProducts().filter((product) => product.id !== id));
}

export function getDemoOrders() {
  return readStorage<Order[]>(demoOrdersKey, []);
}

export function getDemoCurrentUser(): User | null {
  const token = localStorage.getItem('authToken');
  const userId = token?.match(/^kisaku-demo-(\d+)$/)?.[1];
  if (!userId) return null;
  const account = demoAccounts.find(({ user }) => user.id === Number(userId));
  return account ? { ...account.user } : null;
}

export function createDemoSession(user: User): AuthResponse {
  const token = `kisaku-demo-${user.id}`;
  localStorage.setItem('authToken', token);
  return { user: { ...user }, token, expires_at: Date.now() + 86400000 };
}

export function loginDemo(email: string, password: string): AuthResponse {
  const account = demoAccounts.find(({ user, password: accountPassword }) =>
    email.trim().toLowerCase() === user.email && password === accountPassword);
  if (!account) throw new Error('Choose a local demo account and use its displayed password.');
  return createDemoSession(account.user);
}

export function createDemoOrder(
  request: CreateOrderRequest,
  total: number,
  paymentMethod: string,
  deliveryMethod: string,
): Order {
  const user = getDemoCurrentUser();
  if (!user) throw new Error('Sign in to your demo account before placing an order.');

  const products = getDemoProducts();
  const orderId = Date.now();
  const orderItems = request.items.map((item, index) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Not enough stock available for ${product?.name ?? 'an item in your cart'}.`);
    }

    product.stock -= item.quantity;
    return {
      id: Date.now() + index,
      order_id: orderId,
      product_id: product.id,
      product,
      quantity: item.quantity,
      price: product.price,
    };
  });

  writeStorage(demoProductsKey, products);

  const order: Order = {
    id: orderId,
    user_id: user.id,
    user,
    total,
    status: 'pending',
    payment_method: paymentMethod,
    delivery_method: deliveryMethod,
    phone_number: request.phone_number,
    created_at: new Date().toISOString(),
    order_items: orderItems,
  };
  writeStorage(demoOrdersKey, [order, ...getDemoOrders()]);
  return order;
}

export function updateDemoOrderStatus(id: number, status: Order['status']) {
  const orders = getDemoOrders();
  const order = orders.find((item) => item.id === id);
  if (order) {
    order.status = status;
    writeStorage(demoOrdersKey, orders);
  }
}

export function getDemoUsers(): User[] {
  const orders = getDemoOrders();
  return demoAccounts.map(({ user }) => ({
    ...user,
    ordersCount: orders.filter((order) => order.user_id === user.id).length,
  }));
}

export function getDemoDashboardSummary(from: string, to: string): AdminDashboardSummary {
  const products = getDemoProducts();
  const orders = getDemoOrders();
  const users = getDemoUsers();
  const withinRange = orders.filter((order) => order.created_at.slice(0, 10) >= from
    && order.created_at.slice(0, 10) <= to);
  const lowStockProducts = products
    .filter((product) => product.stock <= 10)
    .map(({ id, name, stock }) => ({ id, name, stock }));
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${to}T12:00:00`);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    return {
      date: dateKey,
      count: withinRange.filter((order) => order.created_at.slice(0, 10) === dateKey).length,
    };
  });

  return {
    product_count: products.length,
    customer_count: users.filter((user) => user.role === 'customer').length,
    order_count: withinRange.length,
    pending_order_count: withinRange.filter((order) => order.status === 'pending').length,
    delivered_order_count: withinRange.filter((order) => order.status === 'delivered').length,
    cancelled_order_count: withinRange.filter((order) => order.status === 'cancelled').length,
    delivered_order_value: withinRange
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0),
    low_stock_product_count: lowStockProducts.filter((product) => product.stock > 0).length,
    out_of_stock_product_count: lowStockProducts.filter((product) => product.stock <= 0).length,
    low_stock_products: lowStockProducts,
    recent_orders: [...withinRange]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    order_trend: trend,
  };
}
