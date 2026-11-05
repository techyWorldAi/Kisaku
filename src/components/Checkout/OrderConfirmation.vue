<template>
  <div class="text-center py-8">
    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
    <p class="text-gray-600 mb-4">
      Thank you for your order. Your order number is 
      <strong class="text-[#155DA5]">#{{ props.order?.id }}</strong>
    </p>
    
    <div class="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
      
      <div class="space-y-3 text-left">
        <div class="flex justify-between">
          <span class="text-gray-600">Order Number:</span>
          <span class="font-medium text-gray-900">#{{ props.order?.id }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Payment Method:</span>
          <span class="font-medium text-gray-900 capitalize">
            {{ getPaymentMethodDisplay(props.order?.payment_method) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Delivery:</span>
          <span class="font-medium text-gray-900 capitalize">
            {{ props.order?.delivery_method || 'Standard' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Total Amount:</span>
          <span class="font-medium text-gray-900">
            Ksh {{ props.order?.total?.toLocaleString() }}
          </span>
        </div>
        <div v-if="props.order?.mpesa_receipt" class="flex justify-between">
          <span class="text-gray-600">M-Pesa Receipt:</span>
          <span class="font-medium text-gray-900">{{ props.order.mpesa_receipt }}</span>
        </div>
      </div>
    </div>

    <div class="mb-8 p-4 bg-blue-50 rounded-xl max-w-md mx-auto">
      <h4 class="font-semibold text-blue-900 mb-2">What's Next?</h4>
      <p class="text-blue-700 text-sm">
        {{ getConfirmationMessage() }}
      </p>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        @click="downloadReceipt"
        class="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span>Download Receipt</span>
      </button>
      <button
        @click="$emit('continue-shopping')"
        class="px-6 py-3 bg-[#FF8500] text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
      >
        Continue Shopping
      </button>
      <button
        @click="$emit('view-orders')"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
      >
        View My Orders
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue';
import type { Order } from '../../services/api';

interface Props {
  order: Order & { payment_method?: string; delivery_method?: string } | null;
}

// Keep emits typing without assigning to a variable
defineEmits<{
  (e: 'continue-shopping'): void;
  (e: 'view-orders'): void;
}>();

const props = defineProps<Props>();

const getPaymentMethodDisplay = (method: string | undefined) => {
  if (method === 'mpesa') return 'M-Pesa';
  if (method === 'cash') return 'Cash on Delivery';
  return method || 'Cash';
};

const getConfirmationMessage = () => {
  const paymentMethod = props.order?.payment_method;
  const deliveryMethod = props.order?.delivery_method;
  
  if (paymentMethod === 'mpesa') {
    return 'Your M-Pesa payment has been processed successfully. You will receive an SMS confirmation shortly.';
  } else {
    if (deliveryMethod === 'pickup') {
      return 'Please bring your order confirmation when collecting your items. Our store hours are Monday-Friday, 9AM-6PM.';
    } else {
      return 'Please have the exact amount ready for the delivery person. Delivery typically takes 1-2 business days.';
    }
  }
};

const downloadReceipt = () => {
  if (!props.order) return;

  // Create receipt content
  const receiptContent = `
T-SHOP RECEIPT
================================

Order Number: #${props.order.id}
Order Date: ${new Date(props.order.created_at).toLocaleDateString()}
Payment Method: ${getPaymentMethodDisplay(props.order.payment_method)}

ORDER ITEMS:
${props.order.order_items?.map(item => 
  `${item.product?.name || 'Product'} - ${item.quantity} x Ksh ${item.price.toLocaleString()} = Ksh ${(item.quantity * item.price).toLocaleString()}`
).join('\n')}

--------------------------------
Subtotal: Ksh ${props.order.order_items?.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
Total: Ksh ${props.order.total.toLocaleString()}

${props.order.mpesa_receipt ? `M-Pesa Receipt: ${props.order.mpesa_receipt}` : ''}

Thank you for your purchase!
T-Shop - Quality African Luxury
================================
  `.trim();

  // Create and download file
  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tshop-receipt-${props.order.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
