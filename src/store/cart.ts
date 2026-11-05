import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<CartItem[]>([]);
  const showCartDropdown = ref(false);

  // Computed properties
  const cartItemsCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // Actions
  function addToCart(product: CartItem) {
    const existingItem = cartItems.value.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.value.push({
        ...product,
        quantity: 1
      });
    }
  }

  function removeFromCart(item: CartItem) {
    cartItems.value = cartItems.value.filter(cartItem => cartItem.id !== item.id);
  }

  function updateQuantity(itemId: number, quantity: number) {
    const item = cartItems.value.find(item => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(item);
      } else {
        item.quantity = quantity;
      }
    }
  }

  function toggleCartDropdown() {
    showCartDropdown.value = !showCartDropdown.value;
  }

  function closeCartDropdown() {
    showCartDropdown.value = false;
  }

  function clearCart() {
    cartItems.value = [];
  }

  return {
    cartItems,
    showCartDropdown,
    cartItemsCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCartDropdown,
    closeCartDropdown,
    clearCart
  }
})