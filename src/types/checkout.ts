export interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryMethod: 'pickup' | 'delivery';
}

export interface PaymentDetails {
  method: 'mpesa' | 'cash';
  phone?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
}

export interface Order {
  id: string;
  items: CartItem[];
  address: Address;
  payment: PaymentDetails;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  deliveryFee: number;
  createdAt: string;
  orderNumber: string;
  userId?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  ordersCount?: number;
  totalSpent?: number;
}