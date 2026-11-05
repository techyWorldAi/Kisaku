import { defineStore } from 'pinia';
import { ref } from 'vue';
import { orderAPI } from '../services/api';
import type { Address, PaymentDetails, User } from '../types/checkout';
import type { Order } from '../services/api';
import type { CartItem } from './cart';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const users = ref<User[]>([]);

  async function createOrder(
    items: CartItem[],
    address: Address,
    payment: PaymentDetails
  ): Promise<Order> {
    try {
      // Convert cart items to backend format
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      const orderData = {
        items: orderItems,
        phone_number: payment.phone || address.phone
      };

      // Create order in backend
      const order = await orderAPI.createOrder(orderData);
      
      currentOrder.value = order;

      return order;
    } catch (error) {
      throw error;
    }
  }

  async function getOrders(): Promise<Order[]> {
    try {
      const data = await orderAPI.getOrders();
      orders.value = data;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function getUserOrders(): Promise<Order[]> {
    try {
      const data = await orderAPI.getUserOrders();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function getOrderById(id: string): Promise<Order | undefined> {
    try {
      const orderId = parseInt(id);
      const order = await orderAPI.getOrder(orderId);
      return order;
    } catch (error) {
      throw error;
    }
  }

  async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const id = parseInt(orderId);
      await orderAPI.updateOrderStatus(id, { status });
      
      // Update local state
      const order = orders.value.find(o => o.id === id);
      if (order) {
        order.status = status;
      }
    } catch (error) {
      throw error;
    }
  }

  async function fetchUsers(): Promise<User[]> {
    try {
      const data = await orderAPI.getUsers();
      users.value = data;
      return data;
    } catch (error) {
      throw error;
    }
  }

  function calculateDeliveryFee(cartTotal: number, deliveryMethod: 'pickup' | 'delivery'): number {
    if (deliveryMethod === 'pickup') return 0;
    
    if (cartTotal <= 500) return 150;
    if (cartTotal <= 1000) return 200;
    return 300;
  }

  // Remove the loadOrders function since we're using backend API
  // Remove the localStorage operations

  return {
    orders,
    currentOrder,
    users,
    createOrder,
    getOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    calculateDeliveryFee,
    fetchUsers,
  };
});