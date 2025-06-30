<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { GSaltTopupRequest, TopupResponse } from '~/types/gsalt_api';
import { useGSaltApi } from '~/composables/gsalt/useGSaltApi';
import { useGSaltToast } from '~/composables/gsalt/useGSaltToast';
import { usePaymentInstructions } from '~/composables/gsalt/usePaymentInstructions';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

useHead({
  title: 'Top Up GSalt - Safatanc Connect',
});

// Composables
const { topup } = useGSaltApi();
const { showToast, toastMessage, toastType, showToastNotification, hideToast } = useGSaltToast();
const {
  copyToClipboard,
  formatVirtualAccountNumber,
  formatExpiryTime,
  isPaymentExpired
} = usePaymentInstructions();

// State
const isLoading = ref(false);
const form = reactive<GSaltTopupRequest>({
  amount_gsalt: '',
  payment_method: 'QRIS',
  payment_currency: 'IDR',
});

// Payment methods
const paymentMethods = [
  // Modern Payment Methods (Flip V3)
  { value: 'QRIS', label: 'QRIS', icon: 'tabler:qrcode', description: 'Indonesian QR Code payment standard', fee: '0.7% (min 2 GSALT)' },
  { value: 'VA_BCA', label: 'BCA Virtual Account', icon: 'tabler:building-bank', description: 'BCA bank transfer', fee: '4 GSALT' },
  { value: 'VA_BNI', label: 'BNI Virtual Account', icon: 'tabler:building-bank', description: 'BNI bank transfer', fee: '4 GSALT' },
  { value: 'VA_BRI', label: 'BRI Virtual Account', icon: 'tabler:building-bank', description: 'BRI bank transfer', fee: '4 GSALT' },
  { value: 'VA_MANDIRI', label: 'Mandiri Virtual Account', icon: 'tabler:building-bank', description: 'Mandiri bank transfer', fee: '4 GSALT' },
  { value: 'VA_CIMB', label: 'CIMB Virtual Account', icon: 'tabler:building-bank', description: 'CIMB bank transfer', fee: '4 GSALT' },
  { value: 'VA_PERMATA', label: 'Permata Virtual Account', icon: 'tabler:building-bank', description: 'Permata bank transfer', fee: '4 GSALT' },
  { value: 'VA_BSI', label: 'BSI Virtual Account', icon: 'tabler:building-bank', description: 'BSI bank transfer', fee: '4 GSALT' },
  { value: 'VA_DANAMON', label: 'Danamon Virtual Account', icon: 'tabler:building-bank', description: 'Danamon bank transfer', fee: '4 GSALT' },
  { value: 'VA_MAYBANK', label: 'Maybank Virtual Account', icon: 'tabler:building-bank', description: 'Maybank bank transfer', fee: '4 GSALT' },
  { value: 'EWALLET_OVO', label: 'OVO', icon: 'tabler:wallet', description: 'OVO e-wallet', fee: '5 GSALT' },
  { value: 'EWALLET_DANA', label: 'DANA', icon: 'tabler:wallet', description: 'DANA e-wallet', fee: '5 GSALT' },
  { value: 'EWALLET_GOPAY', label: 'GoPay', icon: 'tabler:wallet', description: 'GoPay e-wallet', fee: '5 GSALT' },
  { value: 'EWALLET_LINKAJA', label: 'LinkAja', icon: 'tabler:wallet', description: 'LinkAja e-wallet', fee: '5 GSALT' },
  { value: 'EWALLET_SHOPEEPAY', label: 'ShopeePay', icon: 'tabler:wallet', description: 'ShopeePay e-wallet', fee: '5 GSALT' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: 'tabler:credit-card', description: 'Visa, Mastercard, JCB, American Express', fee: '2.9% (min 10 GSALT)' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: 'tabler:credit-card', description: 'Debit card payments', fee: '2.9% (min 10 GSALT)' },
  { value: 'RETAIL_ALFAMART', label: 'Alfamart', icon: 'tabler:building-store', description: 'Pay at Alfamart outlets', fee: '5 GSALT' },
  { value: 'RETAIL_INDOMARET', label: 'Indomaret', icon: 'tabler:building-store', description: 'Pay at Indomaret outlets', fee: '5 GSALT' },
  { value: 'RETAIL_CIRCLEK', label: 'Circle K', icon: 'tabler:building-store', description: 'Pay at Circle K outlets', fee: '5 GSALT' },
  { value: 'RETAIL_LAWSON', label: 'Lawson', icon: 'tabler:building-store', description: 'Pay at Lawson outlets', fee: '5 GSALT' },
  { value: 'DIRECT_DEBIT', label: 'Direct Debit', icon: 'tabler:credit-card-off', description: 'Direct debit from bank account', fee: '3 GSALT' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'tabler:building-bank', description: 'Manual bank transfer', fee: 'Free' },
];

// Helper functions for payment method information
const getPaymentMethodInfo = (method: string) => {
  return paymentMethods.find(m => m.value === method);
};

const getPaymentMethodIcon = (method: string) => {
  const info = getPaymentMethodInfo(method);
  return info?.icon || 'tabler:credit-card';
};

const getPaymentMethodLabel = (method: string) => {
  const info = getPaymentMethodInfo(method);
  return info?.label || method;
};

// Generate QR Code Data URL
const generateQRCodeDataURL = (qrString: string): string => {
  // Simple QR code generation using a service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
};

// Get bank name from bank code
const getBankName = (bankCode: string): string => {
  const bankNames: Record<string, string> = {
    'BCA': 'BCA',
    'BNI': 'BNI',
    'BRI': 'BRI',
    'MANDIRI': 'Mandiri',
    'CIMB': 'CIMB Niaga',
    'PERMATA': 'Permata',
    'BSI': 'BSI',
    'DANAMON': 'Danamon',
    'MAYBANK': 'Maybank'
  };
  return bankNames[bankCode] || bankCode;
};

// Get e-wallet name
const getEWalletName = (method: string): string => {
  const ewalletNames: Record<string, string> = {
    'EWALLET_OVO': 'OVO',
    'EWALLET_DANA': 'DANA',
    'EWALLET_GOPAY': 'GoPay',
    'EWALLET_LINKAJA': 'LinkAja',
    'EWALLET_SHOPEEPAY': 'ShopeePay'
  };
  return ewalletNames[method] || method;
};

const handleSubmit = async () => {
  // Validate amount_gsalt is a valid number
  const amount = parseFloat(form.amount_gsalt);
  if (isNaN(amount) || amount <= 0) {
    showToastNotification('Please enter a valid amount greater than 0', 'error');
    return;
  }

  try {
    isLoading.value = true;

    const request: GSaltTopupRequest = {
      amount_gsalt: form.amount_gsalt.trim(),
      payment_method: form.payment_method,
      payment_currency: form.payment_currency,
    };

    const result: TopupResponse = await topup(request);

    if (result.transaction.status === 'pending') {
      showToastNotification('Payment instructions created! Redirecting to payment page...');

      // Redirect to payment page with external reference ID or transaction ID
      const paymentId = result.transaction.external_reference_id || result.transaction.id;
      setTimeout(() => {
        navigateTo(`/gsalt/payment/${paymentId}`);
      }, 1500);
    } else {
      // For bank transfer or already completed payments
      showToastNotification('Top up request created successfully!');
      // Reset form and redirect
      Object.assign(form, {
        amount_gsalt: '',
        payment_method: 'QRIS',
        payment_currency: 'IDR',
      });

      setTimeout(() => {
        navigateTo('/gsalt');
      }, 2000);
    }

  } catch (error: any) {
    showToastNotification(error.message || 'Top up failed', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Helper functions for payment method checking
const isVirtualAccountMethod = (method: string) => {
  return method?.startsWith('VA_');
};

const isEWalletMethod = (method: string) => {
  return method?.startsWith('EWALLET_');
};

const isRetailMethod = (method: string) => {
  return method?.startsWith('RETAIL_');
};

const isCardMethod = (method: string) => {
  return method === 'CREDIT_CARD' || method === 'DEBIT_CARD';
};
</script>

<template>
  <div class="py-6">
    <div class="container mx-auto px-4 md:px-8 max-w-2xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <NuxtLink to="/gsalt" class="p-2 rounded-full bg-dark-2 hover:bg-brand hover:text-black transition-colors">
            <Icon icon="tabler:arrow-left" width="20" height="20" />
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold text-white">Top Up GSalt</h1>
            <p class="text-gray-400">Add funds to your GSalt balance</p>
          </div>
        </div>
      </div>

      <!-- Top Up Form -->
      <div class="bg-dark-2 rounded-3xl p-6 border border-dark">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
            <Icon icon="tabler:plus" class="text-brand" width="24" height="24" />
          </div>
          <h3 class="text-xl font-semibold text-white">Add GSalt to Your Account</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Payment Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <div class="grid gap-3">
              <div v-for="method in paymentMethods" :key="method.value" class="relative">
                <input v-model="form.payment_method" :value="method.value" type="radio" :id="method.value"
                  class="sr-only peer">
                <label :for="method.value"
                  class="flex items-center gap-4 p-4 bg-dark-3 border border-dark rounded-2xl cursor-pointer hover:bg-dark-2 peer-checked:border-brand peer-checked:bg-brand/10 transition-all duration-300">
                  <Icon :icon="method.icon" class="text-brand flex-shrink-0" width="24" height="24" />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium text-white">{{ method.label }}</h4>
                      <span class="text-xs text-brand font-medium">{{ method.fee }}</span>
                    </div>
                    <p class="text-gray-400 text-sm">{{ method.description }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Fee Information -->
          <div class="bg-brand/10 border border-brand/30 rounded-2xl p-4">
            <div class="flex items-start gap-3">
              <Icon icon="tabler:info-circle" class="text-brand flex-shrink-0 mt-0.5" width="20" height="20" />
              <div>
                <h4 class="font-semibold text-brand mb-1">Payment Fees</h4>
                <p class="text-brand/80 text-sm">
                  All payment processing fees are paid by you (the user) and will be added to your transaction amount.
                  The fees shown are transparent and calculated automatically.
                </p>
              </div>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount (GSALT)</label>
            <input v-model="form.amount_gsalt" type="text" inputmode="decimal" pattern="[0-9]+(\.[0-9]+)?" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors"
              placeholder="Enter GSALT amount (e.g., 10.50)">
            <p class="text-gray-400 text-sm mt-2">
              1 GSALT = 1,000 IDR (default exchange rate)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Payment Currency</label>
            <select v-model="form.payment_currency" required
              class="w-full px-4 py-3 bg-dark-3 border border-dark rounded-2xl text-white focus:border-brand focus:bg-dark-2 transition-colors">
              <option value="IDR">Indonesian Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
            </select>
          </div>

          <div class="bg-dark-3 rounded-2xl p-4">
            <h4 class="font-semibold text-white mb-2">Transaction Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Amount:</span>
                <span class="text-white">{{ form.amount_gsalt || '0' }} GSALT</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Payment Method:</span>
                <span class="text-white">{{ getPaymentMethodLabel(form.payment_method || '') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Currency:</span>
                <span class="text-white">{{ form.payment_currency }}</span>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="isLoading || !form.amount_gsalt"
            class="w-full py-3 bg-brand text-black rounded-2xl font-semibold hover:bg-brand/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon v-if="isLoading" icon="tabler:loader" class="animate-spin mr-2" width="20" height="20" />
            {{ isLoading ? 'Processing...' : 'Top Up GSalt' }}
          </button>

          <div class="text-center">
            <NuxtLink to="/gsalt" class="text-gray-400 hover:text-white text-sm transition-colors">
              Cancel and go back
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" :class="[
      'fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg max-w-sm transition-all duration-300',
      toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    ]">
      <div class="flex items-center gap-3">
        <Icon :icon="toastType === 'success' ? 'tabler:check-circle' : 'tabler:alert-circle'" width="20" height="20" />
        <p class="font-medium">{{ toastMessage }}</p>
        <button @click="hideToast" class="ml-auto">
          <Icon icon="tabler:x" width="16" height="16" />
        </button>
      </div>
    </div>
  </div>
</template>