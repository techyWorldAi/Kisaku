<template>
  <div class="cart-page min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Cart Items -->
        <div class="lg:flex-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div class="bg-[#155DA5] px-6 py-4">
              <h1 class="text-2xl font-bold text-white">Shopping Cart</h1>
              <p v-if="cartStore.cartItemsCount > 0" class="mt-1 text-blue-100">
                {{ cartStore.cartItemsCount }} item{{ cartStore.cartItemsCount > 1 ? 's' : '' }} in your cart
              </p>
            </div>

            <!-- Empty Cart -->
            <div v-if="cartStore.cartItemsCount === 0" class="text-center py-16">
              <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p class="text-gray-600 mb-6">Add some products to get started!</p>
              <router-link 
                to="/shop" 
                class="inline-flex items-center bg-[#FF8500] text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                Continue Shopping
              </router-link>
            </div>

            <!-- Cart Items List -->
            <div v-else class="divide-y divide-gray-200">
              <div 
                v-for="item in cartStore.cartItems" 
                :key="item.id"
                class="cart-item-row p-6 flex items-center space-x-4"
              >
                <!-- Product Image -->
                <div class="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-contain p-2" />
                  <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>

                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">{{ item.name }}</h3>
                  <p class="text-gray-600">Ksh {{ item.price.toLocaleString() }}</p>
                </div>

                <!-- Quantity Controls -->
                <div class="cart-quantity flex items-center space-x-3">
                  <button 
                    @click="decreaseQuantity(item)"
                    :aria-label="`Decrease quantity of ${item.name}`"
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <span class="text-lg font-semibold text-gray-900 w-8 text-center">{{ item.quantity }}</span>
                  <button 
                    @click="increaseQuantity(item)"
                    :aria-label="`Increase quantity of ${item.name}`"
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>

                <!-- Item Total -->
                <div class="cart-item-total text-right">
                  <p class="text-lg font-semibold text-gray-900">Ksh {{ (item.price * item.quantity).toLocaleString() }}</p>
                </div>

                <!-- Remove Button -->
                <button 
                  @click="removeItem(item)"
                  :aria-label="`Remove ${item.name} from cart`"
                  class="cart-remove text-red-600 hover:text-red-800 transition-colors duration-200 p-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:w-96">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-gray-900">Ksh {{ cartStore.cartTotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Delivery</span>
                <span class="text-gray-600">Calculated at checkout</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between text-lg font-semibold">
                  <span class="text-gray-900">Subtotal</span>
                  <span class="text-gray-900">Ksh {{ cartStore.cartTotal.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <button
              @click="proceedToCheckout"
              :disabled="cartStore.cartItemsCount === 0"
              class="w-full bg-[#FF8500] text-white py-4 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold text-lg"
            >
              Proceed to Checkout
            </button>

            <router-link 
              to="/shop" 
              class="w-full mt-4 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-semibold text-center block"
            >
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCartStore, type CartItem } from '../store/cart';
import Header from '../components/layout/Menu.vue';

const router = useRouter();
const cartStore = useCartStore();

function increaseQuantity(item: CartItem) {
  cartStore.updateQuantity(item.id, item.quantity + 1);
}

function decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1);
  } else {
    cartStore.removeFromCart(item);
  }
}

function removeItem(item: CartItem) {
  cartStore.removeFromCart(item);
}

function proceedToCheckout() {
  router.push('/checkout');
}
</script>

<style scoped>
.cart-page {
  color: #102a43;
}

.cart-item-row {
  min-width: 0;
}

.cart-quantity button {
  width: 40px;
  height: 40px;
}

@media (max-width: 640px) {
  .cart-page main {
    width: calc(100% - 28px);
    padding-right: 0;
    padding-left: 0;
  }

  .cart-item-row {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 14px;
  }

  .cart-item-row > div:first-child {
    width: 58px;
    height: 58px;
    grid-row: 1;
    grid-column: 1;
  }

  .cart-item-row > div:nth-child(2) {
    grid-row: 1;
    grid-column: 2;
  }

  .cart-item-row > div:nth-child(2) h3 {
    font-size: 0.9rem;
  }

  .cart-quantity {
    grid-row: 2;
    grid-column: 2;
    gap: 8px;
  }

  .cart-quantity button {
    width: 36px;
    height: 36px;
  }

  .cart-item-total {
    grid-row: 2;
    grid-column: 3;
    align-self: center;
  }

  .cart-item-total p {
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .cart-remove {
    grid-row: 1;
    grid-column: 3;
    align-self: start;
  }
}
</style>