<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Minus, Plus, Search, ShoppingBasket, Trash2 } from 'lucide-vue-next';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import { getApiErrorMessage, productAPI, salesAPI } from '../../services/api';
import type { Order, Product, SalesCustomer } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { formatOrderNumber } from '../../utils/orderNumber';

interface OrderLine {
  product: Product;
  quantity: number;
}

const authStore = useAuthStore();
const router = useRouter();
const customerQuery = ref('');
const customers = ref<SalesCustomer[]>([]);
const selectedCustomer = ref<SalesCustomer | null>(null);
const customerSearchLoading = ref(false);
const customerSearchError = ref('');
const products = ref<Product[]>([]);
const productsLoading = ref(true);
const productsError = ref('');
const selectedProductId = ref<number | ''>('');
const orderLines = ref<OrderLine[]>([]);
const phoneNumber = ref('');
const paymentMethod = ref<'cash' | 'mpesa'>('cash');
const submitting = ref(false);
const orderError = ref('');
const completedOrder = ref<Order | null>(null);
let customerSearchTimer: ReturnType<typeof setTimeout> | undefined;

const selectedProduct = computed(() => products.value.find((product) => product.id === selectedProductId.value));
const orderTotal = computed(() => orderLines.value.reduce(
  (total, line) => total + Number(line.product.price) * line.quantity,
  0,
));

function searchCustomers() {
  selectedCustomer.value = null;
  customers.value = [];
  customerSearchError.value = '';
  if (customerSearchTimer) clearTimeout(customerSearchTimer);
  const query = customerQuery.value.trim();
  if (query.length < 2) return;
  customerSearchTimer = setTimeout(() => {
    void fetchCustomers(query);
  }, 250);
}

async function fetchCustomers(query: string) {
  customerSearchLoading.value = true;
  customerSearchError.value = '';
  try {
    customers.value = await salesAPI.getCustomers(query);
  } catch (error) {
    console.error('Failed to search sales customers:', error);
    customerSearchError.value = getApiErrorMessage(error, 'Customer search failed. Try again.');
  } finally {
    customerSearchLoading.value = false;
  }
}

async function loadProducts() {
  productsLoading.value = true;
  productsError.value = '';
  try {
    products.value = await productAPI.getPublicProducts();
  } catch (error) {
    console.error('Failed to load products for sales order:', error);
    productsError.value = 'Products could not be loaded. Check your connection and try again.';
  } finally {
    productsLoading.value = false;
  }
}

function addProduct() {
  const product = selectedProduct.value;
  if (!product || product.stock < 1) return;
  const existingLine = orderLines.value.find((line) => line.product.id === product.id);
  if (existingLine) {
    if (existingLine.quantity < product.stock) existingLine.quantity += 1;
    return;
  }
  orderLines.value.push({ product, quantity: 1 });
  selectedProductId.value = '';
}

function changeQuantity(line: OrderLine, amount: number) {
  const nextQuantity = line.quantity + amount;
  if (nextQuantity < 1 || nextQuantity > line.product.stock) return;
  line.quantity = nextQuantity;
}

function formatCurrency(value: number) {
  return `KES ${value.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

async function submitOrder() {
  orderError.value = '';
  completedOrder.value = null;
  if (!selectedCustomer.value) {
    orderError.value = 'Choose a customer before placing the order.';
    return;
  }
  if (!orderLines.value.length) {
    orderError.value = 'Add at least one product to the order.';
    return;
  }

  submitting.value = true;
  try {
    completedOrder.value = await salesAPI.createOrder({
      customer_id: selectedCustomer.value.id,
      items: orderLines.value.map((line) => ({
        product_id: line.product.id,
        quantity: line.quantity,
      })),
      ...(phoneNumber.value.trim() ? { phone_number: phoneNumber.value.trim() } : {}),
      payment_method: paymentMethod.value,
    });
    orderLines.value = [];
    phoneNumber.value = '';
    await loadProducts();
  } catch (error) {
    console.error('Failed to place sales-assisted order:', error);
    orderError.value = getApiErrorMessage(error, 'Order could not be placed. Try again.');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (!authStore.canAccessSales) {
    void router.replace('/profile');
    return;
  }
  void loadProducts();
});

onUnmounted(() => {
  if (customerSearchTimer) clearTimeout(customerSearchTimer);
});
</script>

<template>
  <div class="sales-page">
    <AdminSidebar />

    <div class="sales-content">
      <header class="sales-topbar">Administration <span>/</span> Sales-assisted orders</header>

      <main class="sales-main">
        <section class="sales-heading">
          <div class="sales-heading-icon"><ShoppingBasket :size="21" /></div>
          <div>
            <p class="sales-eyebrow">CUSTOMER SERVICE</p>
            <h1>Place an order for a customer</h1>
            <p>Find a registered customer, build their order, and let the server calculate the final total.</p>
          </div>
        </section>

        <div class="sales-note">
          The signed-in sales account is recorded automatically. Order ownership, order number, price, and stock are verified by the server.
        </div>

        <div v-if="completedOrder" class="sales-success" role="status">
          <strong>Order placed successfully</strong>
          <span>
            Order #{{ formatOrderNumber(completedOrder.id, completedOrder.order_number) }}
            <span v-if="completedOrder.order_tag"> · {{ completedOrder.order_tag }}</span>
          </span>
          <span>{{ formatCurrency(completedOrder.total) }} · {{ completedOrder.status }}</span>
        </div>
        <div v-if="orderError" class="sales-error" role="alert">{{ orderError }}</div>

        <div class="sales-grid">
          <section class="sales-panel">
            <div class="panel-title">
              <span class="step-number">1</span>
              <div>
                <h2>Select customer</h2>
                <p>Search using at least two characters of their name or email.</p>
              </div>
            </div>

            <label class="sales-field">
              <span>Customer name or email</span>
              <span class="search-control">
                <Search :size="17" />
                <input
                  v-model="customerQuery"
                  type="search"
                  autocomplete="off"
                  placeholder="Search customers"
                  @input="searchCustomers"
                />
              </span>
            </label>

            <p v-if="customerSearchLoading" class="sales-hint">Searching customers…</p>
            <p v-else-if="customerSearchError" class="sales-error inline-error" role="alert">{{ customerSearchError }}</p>
            <div v-else-if="customerQuery.trim().length >= 2 && customers.length" class="customer-results">
              <button
                v-for="customer in customers"
                :key="customer.id"
                type="button"
                :class="{ selected: selectedCustomer?.id === customer.id }"
                @click="selectedCustomer = customer"
              >
                <span class="customer-avatar">{{ customer.name.slice(0, 1).toUpperCase() }}</span>
                <span class="customer-copy">
                  <strong>{{ customer.name }}</strong>
                  <small>{{ customer.email }}</small>
                </span>
                <span v-if="selectedCustomer?.id === customer.id" class="selected-mark">Selected</span>
              </button>
            </div>
            <p v-else-if="customerQuery.trim().length >= 2" class="sales-hint">No customers found for that search.</p>

            <div v-if="selectedCustomer" class="selected-customer">
              <strong>Order for {{ selectedCustomer.name }}</strong>
              <span>{{ selectedCustomer.email }}</span>
            </div>

            <div class="panel-title product-step">
              <span class="step-number">2</span>
              <div>
                <h2>Add products</h2>
                <p>Available stock is displayed. The backend rechecks stock when submitted.</p>
              </div>
            </div>

            <div v-if="productsError" class="sales-error inline-error" role="alert">
              {{ productsError }}
              <button type="button" class="text-button" @click="loadProducts">Retry</button>
            </div>
            <div v-else class="add-product-row">
              <select v-model="selectedProductId" :disabled="productsLoading">
                <option value="">{{ productsLoading ? 'Loading products…' : 'Choose a product' }}</option>
                <option v-for="product in products" :key="product.id" :value="product.id" :disabled="product.stock < 1">
                  {{ product.name }} · {{ formatCurrency(product.price) }} · {{ product.stock }} in stock
                </option>
              </select>
              <button type="button" class="add-product-button" :disabled="!selectedProduct || selectedProduct.stock < 1" @click="addProduct">
                <Plus :size="17" />
                Add
              </button>
            </div>
          </section>

          <section class="sales-panel order-panel">
            <div class="panel-title">
              <span class="step-number">3</span>
              <div>
                <h2>Review and place order</h2>
                <p>Prices below are an estimate; the server determines the final total.</p>
              </div>
            </div>

            <div v-if="orderLines.length" class="order-lines">
              <article v-for="line in orderLines" :key="line.product.id" class="order-line">
                <div class="line-product">
                  <strong>{{ line.product.name }}</strong>
                  <span>{{ formatCurrency(line.product.price) }} each</span>
                </div>
                <div class="quantity-control" :aria-label="`Quantity for ${line.product.name}`">
                  <button type="button" :aria-label="`Decrease ${line.product.name} quantity`" @click="changeQuantity(line, -1)">
                    <Minus :size="14" />
                  </button>
                  <span>{{ line.quantity }}</span>
                  <button
                    type="button"
                    :aria-label="`Increase ${line.product.name} quantity`"
                    :disabled="line.quantity >= line.product.stock"
                    @click="changeQuantity(line, 1)"
                  >
                    <Plus :size="14" />
                  </button>
                </div>
                <strong class="line-total">{{ formatCurrency(line.product.price * line.quantity) }}</strong>
                <button type="button" class="remove-line" :aria-label="`Remove ${line.product.name}`" @click="orderLines = orderLines.filter((item) => item !== line)">
                  <Trash2 :size="16" />
                </button>
              </article>
            </div>
            <div v-else class="empty-order">Add a product to start building this order.</div>

            <div class="sales-fields-grid">
              <label class="sales-field">
                <span>Customer phone (optional)</span>
                <input v-model="phoneNumber" type="tel" autocomplete="tel" placeholder="e.g. 0712 345 678" maxlength="30" />
              </label>
              <label class="sales-field">
                <span>Payment method</span>
                <select v-model="paymentMethod">
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
              </label>
            </div>

            <div class="order-total">
              <span>Estimated total</span>
              <strong>{{ formatCurrency(orderTotal) }}</strong>
            </div>

            <button type="button" class="submit-order" :disabled="submitting || !selectedCustomer || !orderLines.length" @click="submitOrder">
              {{ submitting ? 'Placing order…' : 'Place customer order' }}
            </button>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.sales-page { min-height: 100vh; background: #f5f7fa; }
.sales-content { min-height: 100vh; margin-left: 246px; }
.sales-topbar { position: sticky; z-index: 20; top: 0; padding: 21px 34px; border-bottom: 1px solid #e3e8ee; background: rgb(255 255 255 / 94%); color: #64748b; font-size: .8rem; backdrop-filter: blur(12px); }
.sales-topbar span { margin: 0 7px; color: #a0acb9; }
.sales-main { width: min(1180px, 100%); margin: 0 auto; padding: 28px clamp(18px, 3vw, 36px) 48px; }
.sales-heading { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
.sales-heading-icon { display: flex; width: 44px; height: 44px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 8px; background: #eaf2f8; color: #075397; }
.sales-eyebrow { margin: 0 0 5px; color: #a65c11; font-size: .65rem; font-weight: 800; letter-spacing: .1em; }
.sales-heading h1 { margin: 0; color: #102a43; font-size: clamp(1.35rem, 3vw, 1.75rem); letter-spacing: -.035em; }
.sales-heading p:last-child { margin: 7px 0 0; color: #64748b; font-size: .83rem; line-height: 1.5; }
.sales-note { margin-bottom: 16px; padding: 12px 14px; border: 1px solid #cfe0ee; border-radius: 6px; background: #f0f7fc; color: #31536e; font-size: .76rem; line-height: 1.5; }
.sales-grid { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: start; gap: 16px; }
.sales-panel { min-width: 0; padding: 20px; border: 1px solid #e3e8ee; border-radius: 8px; background: #fff; box-shadow: 0 4px 14px rgb(16 44 73 / 3%); }
.panel-title { display: flex; align-items: flex-start; gap: 11px; margin-bottom: 16px; }
.step-number { display: inline-flex; width: 27px; height: 27px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 50%; background: #eaf2f8; color: #075397; font-size: .75rem; font-weight: 800; }
.panel-title h2 { margin: 1px 0 0; color: #20394f; font-size: .94rem; }
.panel-title p { margin: 5px 0 0; color: #718096; font-size: .72rem; line-height: 1.45; }
.sales-field { display: grid; min-width: 0; gap: 7px; color: #526579; font-size: .73rem; font-weight: 650; }
.search-control { display: flex; min-height: 42px; align-items: center; gap: 9px; padding: 0 11px; border: 1px solid #d5dee7; border-radius: 5px; color: #8290a0; }
.search-control:focus-within { border-color: #075397; box-shadow: 0 0 0 3px rgb(7 83 151 / 10%); }
.search-control input { width: 100%; min-width: 0; border: 0; outline: 0; color: #20394f; font: inherit; font-size: .82rem; }
.customer-results { display: grid; max-height: 230px; overflow-y: auto; margin-top: 8px; border: 1px solid #e3e8ee; border-radius: 6px; }
.customer-results button { display: flex; min-width: 0; align-items: center; gap: 10px; padding: 10px; border: 0; border-bottom: 1px solid #edf0f3; background: #fff; text-align: left; cursor: pointer; }
.customer-results button:last-child { border-bottom: 0; }
.customer-results button:hover, .customer-results button.selected { background: #f0f7fc; }
.customer-avatar { display: flex; width: 32px; height: 32px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 50%; background: #eaf2f8; color: #075397; font-size: .78rem; font-weight: 800; }
.customer-copy { display: grid; min-width: 0; flex: 1; gap: 3px; }
.customer-copy strong { overflow: hidden; color: #20394f; font-size: .77rem; text-overflow: ellipsis; white-space: nowrap; }
.customer-copy small { overflow: hidden; color: #718096; font-size: .7rem; text-overflow: ellipsis; white-space: nowrap; }
.selected-mark { color: #167445; font-size: .68rem; font-weight: 700; }
.selected-customer { display: grid; gap: 3px; margin-top: 10px; padding: 11px; border: 1px solid #b7e4c7; border-radius: 5px; background: #f0fdf4; color: #17613d; font-size: .76rem; }
.selected-customer span { color: #4a7560; }
.sales-hint { margin: 8px 0; color: #718096; font-size: .73rem; }
.sales-error { margin-bottom: 14px; padding: 11px 13px; border: 1px solid #fecaca; border-radius: 5px; background: #fef2f2; color: #991b1b; font-size: .78rem; line-height: 1.45; }
.inline-error { margin-top: 9px; }
.product-step { margin: 24px 0 14px; }
.add-product-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.add-product-row select, .sales-field > select, .sales-fields-grid input { width: 100%; min-width: 0; min-height: 42px; padding: 9px 10px; border: 1px solid #d5dee7; border-radius: 5px; background: #fff; color: #334155; font: inherit; font-size: .78rem; }
.add-product-button, .submit-order { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: 6px; padding: 0 13px; border: 0; border-radius: 5px; background: #075397; color: #fff; font: inherit; font-size: .77rem; font-weight: 700; cursor: pointer; }
.add-product-button:disabled, .submit-order:disabled { opacity: .5; cursor: not-allowed; }
.text-button { margin-left: 7px; border: 0; background: transparent; color: #075397; font: inherit; font-weight: 700; cursor: pointer; }
.order-panel { position: sticky; top: 80px; }
.order-lines { border-top: 1px solid #edf0f3; }
.order-line { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid #edf0f3; }
.line-product { display: grid; min-width: 0; gap: 4px; }
.line-product strong { overflow: hidden; color: #20394f; font-size: .75rem; text-overflow: ellipsis; }
.line-product span { color: #718096; font-size: .68rem; }
.quantity-control { display: flex; align-items: center; gap: 8px; color: #334155; font-size: .75rem; }
.quantity-control button, .remove-line { display: inline-flex; width: 27px; height: 27px; align-items: center; justify-content: center; border: 1px solid #dce3ea; border-radius: 4px; background: #fff; color: #526579; cursor: pointer; }
.quantity-control button:disabled { opacity: .4; cursor: not-allowed; }
.line-total { color: #20394f; font-size: .74rem; white-space: nowrap; }
.remove-line { border-color: transparent; color: #b42318; }
.empty-order { padding: 25px 10px; border-top: 1px solid #edf0f3; border-bottom: 1px solid #edf0f3; color: #718096; font-size: .76rem; text-align: center; }
.sales-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; margin-top: 17px; }
.order-total { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 15px; padding-top: 14px; border-top: 1px solid #e3e8ee; color: #526579; font-size: .79rem; }
.order-total strong { color: #102a43; font-size: 1.02rem; }
.submit-order { width: 100%; margin-top: 14px; background: #f58216; }
.submit-order:hover:not(:disabled) { background: #df700d; }
.sales-success { display: grid; gap: 4px; margin-bottom: 14px; padding: 13px; border: 1px solid #b7e4c7; border-radius: 6px; background: #f0fdf4; color: #17613d; font-size: .78rem; }
.sales-success strong { font-size: .86rem; }
@media (max-width: 1000px) { .sales-grid { grid-template-columns: 1fr; } .order-panel { position: static; } }
@media (max-width: 800px) { .sales-content { margin-left: 0; } .sales-topbar { padding-left: 64px; } }
@media (max-width: 480px) { .sales-main { padding: 20px 12px 32px; } .sales-panel { padding: 14px; } .sales-fields-grid { grid-template-columns: 1fr; } .order-line { grid-template-columns: minmax(0, 1fr) auto auto; gap: 7px; } .line-total { display: none; } }
</style>
